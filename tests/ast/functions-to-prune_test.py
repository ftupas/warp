import difflib
import os
import pytest

from yul.AstTools import AstParser, AstPrinter
from yul.FunctionPruner import FunctionPruner

def test_function_prunner():
    ast_file_path = str(__file__)[:-8] + '.ast'
    with open(ast_file_path, 'r') as ast_file:
        parser = AstParser(ast_file.read())
    
    public_functions = ["funA", "funD", "funE"]
    yul_ast = parser.parse_node()
    yul_ast = FunctionPruner(public_functions).map(yul_ast)

    generated_ast = AstPrinter().format(yul_ast)
    temp_file_path = f"{ast_file_path}.temp"
    with open(temp_file_path, 'w') as temp_file:
        temp_file.write(generated_ast)

    with open(ast_file_path + ".result", "r") as result_file:
        expected_ast = result_file.read()

    compare_codes(generated_ast.splitlines(), expected_ast.splitlines())
    os.remove(temp_file_path)

def compare_codes(lines1, lines2):
    d = difflib.unified_diff(lines1, lines2, n=1, lineterm="")

    message = "\n".join([line for line in d])
    assert len(message) == 0, message