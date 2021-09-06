import re

UPPERCASE_PATTERN = re.compile(r"[A-Z]")

STATEMENT_STRINGS = {
    "ExpressionStatement",
    "Assignment",
    "VariableDeclaration",
    "FunctionDefinition",
    "If",
    "Switch",
    "ForLoop",
    "Break",
    "Continue",
    "Leave",
    "Block",
}


def is_statement(node):
    return type(node).__name__ in STATEMENT_STRINGS


def remove_prefix(text, prefix):
    if text.startswith(prefix):
        return text[len(prefix) :]
    return text


def snakify(camel_case: str) -> str:
    """ThisCaseWord -> this_case_word"""
    return remove_prefix(
        UPPERCASE_PATTERN.sub(lambda m: f"_{m.group(0).lower()}", camel_case), "_"
    )


def camelize(snake_case: str) -> str:
    """this_case_word -> ThisCaseWord"""
    parts = snake_case.split("_")
    if not parts:
        return snake_case
    if any(x == "" for x in parts):
        raise ValueError(
            f"Can't camelize {snake_case}."
            " It probably contains several consecutive underscores."
        )
    return "".join(x.capitalize() for x in parts)
