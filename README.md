[![Stories in Ready](https://badge.waffle.io/omarcastro/shellhive.png?label=ready&title=Ready)](https://waffle.io/omarcastro/shellhive)
[![Build Status](https://drone.io/github.com/OmarCastro/ShellHive/status.png)](https://drone.io/github.com/OmarCastro/ShellHive/latest)
[![Coverage Status](http://omarcastro.github.io/ShellHive/coverage/badge.png)](http://omarcastro.github.io/ShellHive/coverage/lcov-report/index.html)
# ShellHive

A Visual data-flow programming web application to create UNIX Shell workflows

The purpose of the application is to ease the development of UNIX scripts, its focus is the
development of scripts for big-data related tasks.


# Getting Started


To begin, this project depends on Node.js and npm


## Instalation


Clone this repository or download the contents, install the dependencies
of this project by using `npm install` and `bower install` 

```bash
git clone https://github.com/OmarCastro/ShellHive.git
cd ShellHive
npm install
bower install

```

(optional) verify that everything is okay by running all the tests

```bash
npm test
```

## Execution

To run the server application, use the following command

```bash
npm start
```

The server is developed using sails.js, if you have it installed you can run it
with

```bash
sails lift
```

Then, the application should be running on 
 ```
http://localhost:1337/
```

Finally, have fun!! :)

