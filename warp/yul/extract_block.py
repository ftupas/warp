from __future__ import annotations

from typing import Callable

import yul.yul_ast as ast


def extract_block_as_function(
    block: ast.Block, name: str, has_leave: bool = False
) -> tuple[ast.FunctionDefinition, ast.Statement]:
    read_vars = block.scope.read_variables
    if has_leave:
        # If there is a leave in the block, some subset of modified
        # variables will also be read at the time of "leaving". We
        # play safe and mark all of the modified variables as read. An
        # opportunity of optimization.
        read_vars |= block.scope.modified_variables
    read_vars = sorted(read_vars)
    mod_vars = sorted(block.scope.modified_variables)
    typed_read_vars = [ast.TypedName(x.name) for x in read_vars]
    typed_mod_vars = [ast.TypedName(x.name) for x in mod_vars]
    fun_def = ast.FunctionDefinition(
        name=name,
        parameters=typed_read_vars,
        return_variables=typed_mod_vars,
        body=block,
    )
    fun_call = ast.FunctionCall(ast.Identifier(name), read_vars)
    fun_stmt = ast.Assignment(variable_names=mod_vars, value=fun_call)
    return fun_def, fun_stmt


DUMMY_CALL = ast.Assignment([], ast.FunctionCall(ast.Identifier("__WARP_DUMMY"), []))


def extract_rec_block_as_function(
    rec_block: Callable[[ast.Statement], ast.Block], name: str, has_leave: bool = False
) -> tuple[ast.FunctionDefinition, ast.Statement]:
    stubbed_body = rec_block(DUMMY_CALL)
    read_vars = stubbed_body.scope.read_variables
    if has_leave:
        # If there is a leave in the block, some subset of modified
        # variables will also be read at the time of "leaving". We
        # play safe and mark all of the modified variables as read. An
        # opportunity of optimization.
        read_vars |= stubbed_body.scope.modified_variables
    read_vars = sorted(read_vars)
    mod_vars = sorted(stubbed_body.scope.modified_variables)
    typed_read_vars = [ast.TypedName(x.name) for x in read_vars]
    typed_mod_vars = [ast.TypedName(x.name) for x in mod_vars]
    fun_call = ast.FunctionCall(ast.Identifier(name), read_vars)
    fun_stmt = ast.Assignment(variable_names=mod_vars, value=fun_call)
    real_body = rec_block(fun_stmt)
    fun_def = ast.FunctionDefinition(
        name=name,
        parameters=typed_read_vars,
        return_variables=typed_mod_vars,
        body=real_body,
    )
    return fun_def, fun_stmt
