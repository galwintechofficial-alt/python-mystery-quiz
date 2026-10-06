import bcrypt from 'bcryptjs';
import { getDb, queryOne, runQuery, saveDb } from './db.ts';

export interface QuestionSeed {
  topic: 'Python Lists' | 'Python Variables' | 'Python Operators';
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const LIST_QUESTIONS: QuestionSeed[] = [
  // 7 Easy
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'Which symbol is used to define a list in Python?',
    option_a: '( ) Parentheses',
    option_b: '[ ] Square brackets',
    option_c: '{ } Curly braces',
    option_d: '< > Angle brackets',
    correct_answer: 'B',
    explanation: 'In Python, lists are ordered collections defined with square brackets [].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'What will len([10, 20, 30, 40]) return in Python?',
    option_a: '3',
    option_b: '4',
    option_c: '5',
    option_d: '40',
    correct_answer: 'B',
    explanation: 'The len() function returns the total number of items in the list, which is 4.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'Given nums = [5, 10, 15], what is the value of nums[0]?',
    option_a: '5',
    option_b: '10',
    option_c: '15',
    option_d: 'IndexError',
    correct_answer: 'A',
    explanation: 'Python lists use zero-based indexing, so nums[0] accesses the first element, which is 5.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'What does the method nums.append(50) do to a list?',
    option_a: 'Inserts 50 at index 0',
    option_b: 'Removes 50 from the list',
    option_c: 'Adds 50 to the end of the list',
    option_d: 'Replaces all elements with 50',
    correct_answer: 'C',
    explanation: 'The append() method adds an item to the very end of the existing list in-place.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'Which operator checks whether an element exists inside a list?',
    option_a: 'exists',
    option_b: 'has',
    option_c: 'in',
    option_d: 'contains',
    correct_answer: 'C',
    explanation: 'The "in" membership operator evaluates to True if the element is present in the list.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'What is the index of the last element in any non-empty list using negative indexing?',
    option_a: '0',
    option_b: '-1',
    option_c: '-0',
    option_d: '-len(list)',
    correct_answer: 'B',
    explanation: 'Negative indexing starts from the end; -1 points to the last element.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Easy',
    question_text: 'What will be the output of [1, 2] + [3, 4]?',
    option_a: '[4, 6]',
    option_b: '[[1, 2], [3, 4]]',
    option_c: '[1, 2, 3, 4]',
    option_d: 'TypeError',
    correct_answer: 'C',
    explanation: 'The + operator concatenates two lists into a single new list containing all elements.'
  },

  // 8 Medium
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'What is the output of the following code?\nnums = [10, 20, 30, 40, 50]\nprint(nums[1:4])',
    option_a: '[10, 20, 30]',
    option_b: '[20, 30, 40]',
    option_c: '[20, 30, 40, 50]',
    option_d: '[10, 20, 30, 40]',
    correct_answer: 'B',
    explanation: 'Slicing [1:4] extracts elements starting at index 1 up to (but excluding) index 4: [20, 30, 40].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'Given lst = [1, 2, 3], what is the result of lst.pop()?',
    option_a: 'Returns 1 and leaves [2, 3]',
    option_b: 'Returns 3 and leaves [1, 2]',
    option_c: 'Returns None and clears the list',
    option_d: 'Deletes all elements',
    correct_answer: 'B',
    explanation: 'pop() without arguments removes and returns the last element (3) from the list.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'What is the difference between append() and extend()?\na = [1, 2]\na.extend([3, 4])\nprint(a)',
    option_a: '[1, 2, [3, 4]]',
    option_b: '[1, 2, 3, 4]',
    option_c: '[3, 4, 1, 2]',
    option_d: 'TypeError',
    correct_answer: 'B',
    explanation: 'extend() iterates over its argument adding each element individually, producing [1, 2, 3, 4].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'What will lst.insert(1, 99) do to lst = [10, 20, 30]?',
    option_a: 'Replaces 20 with 99: [10, 99, 30]',
    option_b: 'Inserts 99 at index 1: [10, 99, 20, 30]',
    option_c: 'Inserts 99 at index 0: [99, 10, 20, 30]',
    option_d: 'Appends 99 to end: [10, 20, 30, 99]',
    correct_answer: 'B',
    explanation: 'insert(index, element) inserts the element before the specified index without overwriting.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'What does lst.remove(x) do if x is present multiple times in lst?',
    option_a: 'Removes all occurrences of x',
    option_b: 'Removes only the first occurrence of x',
    option_c: 'Removes only the last occurrence of x',
    option_d: 'Raises a ValueError',
    correct_answer: 'B',
    explanation: 'The remove() method removes only the first occurrence of the specified value.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'What is the output of [7] * 3 in Python?',
    option_a: '[21]',
    option_b: '[7, 7, 7]',
    option_c: '[[7], [7], [7]]',
    option_d: 'TypeError',
    correct_answer: 'B',
    explanation: 'Multiplying a list by an integer n repeats the list elements n times: [7, 7, 7].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'What is the output of the following code?\nx = [1, 2, 3, 4]\nx[1:3] = [8, 9]\nprint(x)',
    option_a: '[1, [8, 9], 4]',
    option_b: '[1, 8, 9, 4]',
    option_c: '[8, 9, 3, 4]',
    option_d: '[1, 8, 9, 3, 4]',
    correct_answer: 'B',
    explanation: 'Slice assignment replaces elements from index 1 up to index 3 with the assigned items: [1, 8, 9, 4].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Medium',
    question_text: 'Given lst = ["a", "b", "c", "b", "a"], what does lst.count("b") return?',
    option_a: '1',
    option_b: '2',
    option_c: '3',
    option_d: 'True',
    correct_answer: 'B',
    explanation: 'The count() method returns the number of times the specified value appears in the list.'
  },

  // 5 Hard
  {
    topic: 'Python Lists',
    difficulty: 'Hard',
    question_text: 'What does this slice expression return?\nnums = [0, 1, 2, 3, 4, 5, 6]\nprint(nums[::-2])',
    option_a: '[6, 4, 2, 0]',
    option_b: '[0, 2, 4, 6]',
    option_c: '[6, 5, 4, 3, 2, 1, 0]',
    option_d: '[5, 3, 1]',
    correct_answer: 'A',
    explanation: 'nums[::-2] steps backwards through the list by 2 starting from the end: [6, 4, 2, 0].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Hard',
    question_text: 'What is the output of the following code?\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))',
    option_a: '3',
    option_b: '4',
    option_c: '1',
    option_d: 'AttributeError',
    correct_answer: 'B',
    explanation: 'Lists are mutable. "b = a" binds b to the same list object in memory, so modifying b modifies a.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Hard',
    question_text: 'What happens when executing lst.remove(99) if 99 is not in lst?',
    option_a: 'Returns False',
    option_b: 'Returns None and does nothing',
    option_c: 'Raises a ValueError',
    option_d: 'Raises an IndexError',
    correct_answer: 'C',
    explanation: 'If the value is not found in the list, lst.remove() raises a ValueError: list.remove(x): x not in list.'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Hard',
    question_text: 'What is the output of this code snippet?\nx = [10, 20, 30, 40]\ndel x[1:3]\nprint(x)',
    option_a: '[10, 40]',
    option_b: '[10, 30, 40]',
    option_c: '[20, 30]',
    option_d: '[10, 20, 40]',
    correct_answer: 'A',
    explanation: 'del x[1:3] removes elements at index 1 and 2 (20 and 30), leaving [10, 40].'
  },
  {
    topic: 'Python Lists',
    difficulty: 'Hard',
    question_text: 'What will lst.clear() do to a list lst = [1, 2, 3]?',
    option_a: 'Deletes the variable lst from memory entirely',
    option_b: 'Removes all elements leaving lst as []',
    option_c: 'Sets lst to None',
    option_d: 'Fills lst with zeros: [0, 0, 0]',
    correct_answer: 'B',
    explanation: 'clear() removes all elements from the list, making it an empty list [] while retaining the object.'
  }
];

export const VARIABLE_QUESTIONS: QuestionSeed[] = [
  // 7 Easy
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'Which operator is used to assign a value to a variable in Python?',
    option_a: '==',
    option_b: '=',
    option_c: ':=',
    option_d: '->',
    correct_answer: 'B',
    explanation: 'The single equals sign (=) is the primary assignment operator in Python.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'Which of the following is a VALID variable name in Python?',
    option_a: '2nd_score',
    option_b: 'my-variable',
    option_c: '_student_name',
    option_d: 'class',
    correct_answer: 'C',
    explanation: 'Variable names can begin with an underscore or letter. They cannot start with a digit, contain hyphens, or use reserved keywords like class.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'Are variable names in Python case-sensitive?',
    option_a: 'Yes, Age and age are different variables',
    option_b: 'No, Age and age refer to the same variable',
    option_c: 'Only when defined inside loops',
    option_d: 'Only when using capital letters at the end',
    correct_answer: 'A',
    explanation: 'Python identifiers are case-sensitive; "Age", "AGE", and "age" are completely distinct variables.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'What will print(type(3.14)) output?',
    option_a: "<class 'int'>",
    option_b: "<class 'float'>",
    option_c: "<class 'decimal'>",
    option_d: "<class 'str'>",
    correct_answer: 'B',
    explanation: 'Numbers with a fractional or decimal component are of type float in Python.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'What is the output of the following code?\nx = 10\nx = 25\nprint(x)',
    option_a: '10',
    option_b: '25',
    option_c: '35',
    option_d: 'SyntaxError',
    correct_answer: 'B',
    explanation: 'Variables can be reassigned at any time; the latest assignment overwrites the previous value to 25.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'Which keyword CANNOT be used as a variable name in Python?',
    option_a: 'value',
    option_b: 'count',
    option_c: 'for',
    option_d: 'total',
    correct_answer: 'C',
    explanation: '"for" is a reserved keyword in Python used for iteration, so it cannot be used as an identifier.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Easy',
    question_text: 'What does x = y = z = 100 do in Python?',
    option_a: 'Compares x, y, and z to 100',
    option_b: 'Assigns 100 to x, y, and z simultaneously',
    option_c: 'Raises a SyntaxError',
    option_d: 'Creates a tuple with 100',
    correct_answer: 'B',
    explanation: 'Chained assignment assigns the same value (100) to all specified variables.'
  },

  // 8 Medium
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What is the Pythonic way to swap the values of variables a and b?',
    option_a: 'swap(a, b)',
    option_b: 'a, b = b, a',
    option_c: 'a = b; b = a',
    option_d: 'a <-> b',
    correct_answer: 'B',
    explanation: 'Python supports tuple unpacking for variable swapping: "a, b = b, a" swaps values without needing a temporary variable.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What is the output of this code snippet?\nx, y = 5, 10\nx, y = y, x + y\nprint(x, y)',
    option_a: '5 15',
    option_b: '10 15',
    option_c: '10 20',
    option_d: '15 10',
    correct_answer: 'B',
    explanation: 'The right-hand side expressions are evaluated first: (10, 5+10) = (10, 15). Then assigned to x and y.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What makes Python a dynamically typed language?',
    option_a: 'Variables must declare their type explicitly with keywords',
    option_b: 'Variables do not have types; values have types and variables can hold any type over time',
    option_c: 'Variable types can only change once during execution',
    option_d: 'Variables are automatically converted to strings',
    correct_answer: 'B',
    explanation: 'In Python, types are associated with run-time values rather than named variable identifiers.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'Which of the following is an INVALID variable name in Python?',
    option_a: '_valid_123',
    option_b: 'True_Score',
    option_c: '2way_street',
    option_d: 'Student_Score_99',
    correct_answer: 'C',
    explanation: 'Identifiers in Python cannot begin with a number (2way_street starts with 2).'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What is the output of the following code?\nx = "5"\ny = 2\nprint(x * y)',
    option_a: '10',
    option_b: '"55"',
    option_c: 'TypeError',
    option_d: 'None',
    correct_answer: 'B',
    explanation: 'Multiplying a string by an integer repeats the string: "5" * 2 results in "55".'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What will happen when running this code?\nscore = 100\nprint(Score)',
    option_a: 'Prints 100',
    option_b: 'Prints None',
    option_c: 'Raises NameError: name "Score" is not defined',
    option_d: 'Raises TypeError',
    correct_answer: 'C',
    explanation: 'Because Python is case-sensitive, "Score" is not recognized and raises a NameError.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What will be the output of the following?\na, b, c = 1, 2.5, "Quiz"\nprint(type(c) == str)',
    option_a: 'True',
    option_b: 'False',
    option_c: 'TypeError',
    option_d: '1',
    correct_answer: 'A',
    explanation: 'c is assigned the string literal "Quiz", so type(c) is str, making the comparison True.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Medium',
    question_text: 'What is the result of reassigning a variable to a different type in Python?\nx = 42\nx = "Python"\nprint(type(x))',
    option_a: 'Raises TypeError on reassignment',
    option_b: "<class 'str'>",
    option_c: "<class 'int'>",
    option_d: "<class 'mixed'>",
    correct_answer: 'B',
    explanation: 'Dynamic typing allows variables to be rebound to values of completely different types at runtime.'
  },

  // 5 Hard
  {
    topic: 'Python Variables',
    difficulty: 'Hard',
    question_text: 'What is the output of the following code?\na = [1, 2]\nb = a\na = [3, 4]\nprint(b)',
    option_a: '[3, 4]',
    option_b: '[1, 2]',
    option_c: '[1, 2, 3, 4]',
    option_d: 'None',
    correct_answer: 'B',
    explanation: 'Reassigning "a = [3, 4]" points a to a new list object. Variable b still references the original [1, 2].'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Hard',
    question_text: 'What happens in Python when executing: x, y, z = 10, 20?',
    option_a: 'z is automatically set to None',
    option_b: 'Raises ValueError: not enough values to unpack',
    option_c: 'Raises TypeError: unpack mismatch',
    option_d: 'z is assigned 0',
    correct_answer: 'B',
    explanation: 'In multiple assignment / unpacking, the number of targets on the left must equal the number of items on the right.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Hard',
    question_text: 'Which of the following built-in names is NOT a reserved keyword and CAN technically be reassigned (though not recommended)?',
    option_a: 'pass',
    option_b: 'print',
    option_c: 'global',
    option_d: 'yield',
    correct_answer: 'B',
    explanation: '"print" is a built-in function name in the builtins namespace, not a reserved language keyword, so it can be shadowed by variable assignment.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Hard',
    question_text: 'What is the output of this code snippet?\nx = 10\ny = x\nx += 5\nprint(x, y)',
    option_a: '15 15',
    option_b: '15 10',
    option_c: '10 10',
    option_d: '10 15',
    correct_answer: 'B',
    explanation: 'Integers are immutable in Python. "x += 5" creates a new integer 15 and rebinds x. Variable y still points to 10.'
  },
  {
    topic: 'Python Variables',
    difficulty: 'Hard',
    question_text: 'According to PEP 8 style guidelines, what is the recommended naming convention for constants in Python?',
    option_a: 'camelCase (e.g., maxScore)',
    option_b: 'snake_case (e.g., max_score)',
    option_c: 'UPPERCASE_WITH_UNDERSCORES (e.g., MAX_SCORE)',
    option_d: 'PascalCase (e.g., MaxScore)',
    correct_answer: 'C',
    explanation: 'PEP 8 specifies that constants should be written in all capital letters with underscores separating words.'
  }
];

export const OPERATOR_QUESTIONS: QuestionSeed[] = [
  // 7 Easy
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'Which operator is used for exponentiation (raising to a power) in Python?',
    option_a: '^',
    option_b: '**',
    option_c: '^^',
    option_d: 'exp()',
    correct_answer: 'B',
    explanation: 'In Python, ** is the power/exponentiation operator (e.g., 2 ** 3 = 8). Note that ^ is bitwise XOR.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'What will 17 % 5 evaluate to in Python?',
    option_a: '3',
    option_b: '2',
    option_c: '3.4',
    option_d: '1',
    correct_answer: 'B',
    explanation: 'The modulus operator (%) returns the remainder of integer division: 17 divided by 5 is 3 with remainder 2.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'Which operator checks whether two values are NOT equal?',
    option_a: '<>',
    option_b: '!==',
    option_c: '!=',
    option_d: 'not ==',
    correct_answer: 'C',
    explanation: 'The != operator checks inequality in Python.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'What is the output of 15 // 4 in Python?',
    option_a: '3.75',
    option_b: '3',
    option_c: '4',
    option_d: '3.0',
    correct_answer: 'B',
    explanation: 'The // operator performs floor division, rounding down to the nearest integer (3).'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'What is the result of True and False in Python?',
    option_a: 'True',
    option_b: 'False',
    option_c: 'None',
    option_d: 'TypeError',
    correct_answer: 'B',
    explanation: 'The logical and operator returns True only if both operands are truthy.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'What does the assignment operator x += 5 do?',
    option_a: 'Sets x equal to 5',
    option_b: 'Adds 5 to x and assigns the result back to x',
    option_c: 'Checks if x equals 5',
    option_d: 'Compares x with 5 and adds 1',
    correct_answer: 'B',
    explanation: 'x += 5 is shorthand for x = x + 5.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Easy',
    question_text: 'What is the output of not (10 > 5)?',
    option_a: 'True',
    option_b: 'False',
    option_c: 'None',
    option_d: 'SyntaxError',
    correct_answer: 'B',
    explanation: '10 > 5 is True. The "not" operator negates it to False.'
  },

  // 8 Medium
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What is the output of 2 + 3 * 4 in Python?',
    option_a: '20',
    option_b: '14',
    option_c: '24',
    option_d: '18',
    correct_answer: 'B',
    explanation: 'Multiplication (*) has higher precedence than addition (+), so 3 * 4 = 12, then 2 + 12 = 14.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What is the difference between "==" and "is" in Python?',
    option_a: '"==" checks memory identity, "is" checks value equality',
    option_b: '"==" checks value equality, "is" checks object identity in memory',
    option_c: 'They are completely identical and interchangeable',
    option_d: '"is" only works on integers',
    correct_answer: 'B',
    explanation: '"==" compares whether two objects have equal values, whereas "is" checks if both references point to the exact same object in memory.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What will the expression 10 or 20 return in Python due to short-circuit evaluation?',
    option_a: 'True',
    option_b: '10',
    option_c: '20',
    option_d: '30',
    correct_answer: 'B',
    explanation: 'The "or" operator evaluates operands left to right. Since 10 is truthy, it immediately returns 10 without evaluating 20.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What will the expression 0 and 50 return in Python?',
    option_a: 'False',
    option_b: '0',
    option_c: '50',
    option_d: 'None',
    correct_answer: 'B',
    explanation: 'In Python, "and" returns the first falsy operand encountered. Since 0 is falsy, it evaluates to 0.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What does the expression -7 // 2 evaluate to in Python?',
    option_a: '-3',
    option_b: '-4',
    option_c: '-3.5',
    option_d: '3',
    correct_answer: 'B',
    explanation: 'Floor division in Python rounds down towards negative infinity: -3.5 floors down to -4.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What will print(1 < 2 < 3) output in Python?',
    option_a: 'True',
    option_b: 'False',
    option_c: 'TypeError',
    option_d: 'SyntaxError',
    correct_answer: 'A',
    explanation: 'Python supports chained comparisons: "1 < 2 < 3" is evaluated as "(1 < 2) and (2 < 3)", which is True.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What is the output of "py" in "python"?',
    option_a: 'True',
    option_b: 'False',
    option_c: '0',
    option_d: 'IndexError',
    correct_answer: 'A',
    explanation: 'The membership operator "in" checks substring inclusion and returns True.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Medium',
    question_text: 'What will be the result of 2 ** 3 ** 2 in Python?',
    option_a: '64',
    option_b: '512',
    option_c: '36',
    option_d: '256',
    correct_answer: 'B',
    explanation: 'The exponentiation operator ** associates from right to left: 3 ** 2 = 9, then 2 ** 9 = 512.'
  },

  // 5 Hard
  {
    topic: 'Python Operators',
    difficulty: 'Hard',
    question_text: 'What is the result of [] or [1, 2] and not []?',
    option_a: 'True',
    option_b: 'False',
    option_c: '[]',
    option_d: '[1, 2]',
    correct_answer: 'A',
    explanation: 'Precedence: "not" > "and" > "or". "not []" is True. "[1, 2] and True" evaluates to True. "[] or True" evaluates to True.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Hard',
    question_text: 'Given x = 256 and y = 256, what does x is y typically evaluate to in CPython, and why?',
    option_a: 'False, because separate integers are always distinct objects',
    option_b: 'True, because CPython pre-allocates and caches small integers from -5 to 256',
    option_c: 'TypeError, because "is" cannot compare numbers',
    option_d: 'Raises a Warning',
    correct_answer: 'B',
    explanation: 'CPython caches integer objects in the range [-5, 256], so x and y refer to the exact same cached object in memory.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Hard',
    question_text: 'What is the output of 5 + 2 == 7 and not 3 > 4?',
    option_a: 'True',
    option_b: 'False',
    option_c: '7',
    option_d: 'SyntaxError',
    correct_answer: 'A',
    explanation: 'Arithmetic (+) evaluates first: 7 == 7 (True). Comparison 3 > 4 is False, so "not False" is True. True and True evaluates to True.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Hard',
    question_text: 'What is the output of the following assignment?\nx = 10\nx *= 2 + 3\nprint(x)',
    option_a: '23',
    option_b: '50',
    option_c: '25',
    option_d: '30',
    correct_answer: 'B',
    explanation: 'In augmented assignment x *= expr, the entire right-hand expression (2 + 3 = 5) is evaluated before multiplication: 10 * 5 = 50.'
  },
  {
    topic: 'Python Operators',
    difficulty: 'Hard',
    question_text: 'What will print(bool("" or 0 or [] or None)) output?',
    option_a: 'True',
    option_b: 'False',
    option_c: 'None',
    option_d: '0',
    correct_answer: 'B',
    explanation: 'All operands are falsy in Python. The chained "or" evaluates to the last falsy item (None), and bool(None) is False.'
  }
];

export const ALL_QUESTIONS: QuestionSeed[] = [
  ...LIST_QUESTIONS,
  ...VARIABLE_QUESTIONS,
  ...OPERATOR_QUESTIONS
];

export async function seedDatabase() {
  await getDb();

  // Validate question counts
  const listCount = LIST_QUESTIONS.length;
  const varCount = VARIABLE_QUESTIONS.length;
  const opCount = OPERATOR_QUESTIONS.length;

  console.log(`Validating question bank: Lists=${listCount}, Variables=${varCount}, Operators=${opCount}`);
  if (listCount !== 20 || varCount !== 20 || opCount !== 20) {
    throw new Error(`Invalid question count! Expected 20 each, got: Lists ${listCount}, Vars ${varCount}, Ops ${opCount}`);
  }

  // Insert or check existing questions
  const existingQuestions = queryOne<{ count: number }>('SELECT COUNT(*) AS count FROM questions');
  if (!existingQuestions || existingQuestions.count < 60) {
    console.log('Seeding 60 questions into SQLite database...');
    // Clear out old questions if incomplete
    runQuery('DELETE FROM questions');

    for (const q of ALL_QUESTIONS) {
      runQuery(
        `INSERT INTO questions (
          topic, question_text, option_a, option_b, option_c, option_d,
          correct_answer, explanation, difficulty, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          q.topic,
          q.question_text,
          q.option_a,
          q.option_b,
          q.option_c,
          q.option_d,
          q.correct_answer,
          q.explanation,
          q.difficulty
        ]
      );
    }
    console.log('Successfully seeded 60 questions into SQLite database.');
  }

  // Seed default admin
  const existingAdmin = queryOne('SELECT id FROM admins WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    console.log('Creating default admin account...');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Admin@Python2026!', salt);
    runQuery('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hash]);
    console.log('Admin account created with username: admin');
  }

  saveDb();
}
