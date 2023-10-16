# Eva interpreter project!

Following the course **Building an Interpreter from scratch** by [@Dmitry Soshnikov](https://github.com/DmitrySoshnikov), I have implemented a basic interpreter for the **Eva** language.

# Eva language 

The Eva programming language has basic capabilities such as numbers, strings, variables, scopes and control structures. It supports several paradigms, like Functional programming and Object-oriented programming.

## Variable declaration

In order to declare a variable, the following syntax should be used:

`(var bar 5)`

In this example, we assign the value 5 to the variable _bar_.

## Arithmetic operations

Eva language supports arithmetic operations such as additions, subtractions, multiplications and divisions.
- Addition: `(+ x y)`
- Subtraction: `(- x y)`
- Multiplication: `(* x y)`
- Division: `(/ x y)`

## Comparison operators
In order to evaluate comparisons between numbers the following operators have been implemented.

- Less than: `(< 1 5)`
- Less or equal than: `(<= 1 5)`
- Equal than: `(= 1 5)`
- Greater or equal than: `(>= 1 5)`
- Greater than: `(> 1 5)`

## If / else conditions

If else conditional structure is possible in this language.
```
(if (< value 0)
  (- value)
value)
```

In this example if the _value_ variable is less than 0, the variable is returned with the opposite symbol.

## While loops
While loop control structure has been added to the language. **For loops** are also available although they have been implemented as syntactic sugar for while loops.

In this example the AST format has been provided.
```
['while', ['<', 'counter', 10],
  ['begin',
    ['set', 'result', ['+', 'result', 1]],
    ['set', 'counter', ['+', 'counter', 1]]
  ]
]
```

In this loop we have a _counter_ variable that is used as a counter. While this variable is less than 10 the loop is executed. Inside the loop a variable _result_ is increased by one.

## Functional programming

Functions are named blocks of code that perform a specific task and can be reused throughout a program. Eva supports functional programming and functions can be defined as follows:

```
(def square (x)
  (* x x)
)
```

Once defined, they can be called this way:

`(square 2)`

## Object-oriented programming

**Classes** are blueprints for creating objects. They define the properties and behaviors that objects will have. **Objects** are instances of a class. They are concrete entities that have the properties and behaviors defined by their class. In Eva they are defined this way:
```
(class Point null
  (begin
    (def constructor (this x y)
      (begin
        (set (prop this x) x)
        (set (prop this y) y)
      )
    )
    (def calc (this)
      (+ (prop this x) (prop this y))
    )
  )
)
(var p (new Point 10 20))
((prop p calc) p)
```

In this example a class Point has been defined with a constructor `constructor (x y)` accepting two variables as parameters. A second method `calc ()` that returns the sum of object properties _x_ and _y_ has been declared.

In order to create a new instance of the class, the following syntax is used:

`(var bar (new Point 10 20))`.

**Inheritance** is also supported. Class inheritance is a mechanism that allows you to create new classes that are based on existing classes. It can be done this way:
```
(class Point3D Point
  (begin
    (def constructor (this x y z)
      (begin
        ((prop (super Point3D) constructor) this x y)
        (set (prop this z) z)
      )
    )
    (def calc (this)
      (+ ((prop (super Point3D) calc) this) (prop this z))
    )
  )
)
(var p (new Point3D 10 20 30))
```
_**Note:** class Point should have been previously defined._


# Usage
## CLI
Expressions can be directly executed in the terminal using the following command. Note that the `-e` flag should be present.

`./bin/eva -e '(var x 10) (print (* x 15))'`

The executable file _eva_ can be found in the `./bin` directory.

## Eva file
The _.eva_ extension is used to pass more complex programs to the interpreter. There is a complete example here `./__test__/test.eva`.

`./bin/eva -f './__tests__/test.eva'`.

In order to pass a file to be executed the `-f` flag is needed.
