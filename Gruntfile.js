module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: '<%= pkg.name %>.js',
        dest: '<%= pkg.name %>.min.js'
      }
    },
    concat: {
      build: {
        src: [
          'src/champion.js',
          'src/util/extend.js',
          'src/util/guid.js',
          'src/util/class.js',
          'src/util/namespace.js',
          'src/util/ioc.js',
          //'src/util/history.js',
          'src/event.js',
          //'src/router.js',
          'src/view.js',
          'src/model.js',
          'src/presenter.js',
          //'src/templates/*.js'
        ],
        dest: '<%= pkg.name %>.js'
      },
      options: {
        banner: '/*\n' +
          ' *  <%= pkg.name %>.js - <%= pkg.version %>\n' +
          ' *  Contributors: ' + '<%= pkg.contributors[0].name %>, <%= pkg.contributors[1].name %>\n' +
          ' *  Description: <%= pkg.description %>\n' + 
          ' *  Source: <%= pkg.repository.url %>\n' + 
          ' *  Champion may be freely distributed under the <%= pkg.license %> license\n' +
          ' */\n\n' +
          ';(function($, undefined) { \n  \'use strict\';\n\n',
        footer: '\n\n}).call(this, jQuery);',
        separator: '\n\n',
        //Adds the file name in a comment before the module and properly tabs the code
        process: function(src, filepath) {
          return '  // Source: ' + filepath + '\n' +
            src.replace(/^/gm, '  ');
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'test-app/server/server.js',
          watchExtensions: ['js', 'json'],
          ignoredFiles: ['node_modules/**', 'test/**']
        }
      }
    },
    watch: {
      test: {
        files: ['src/**/*.js', 'test/spec/**/*.js'],
        tasks: ['concat:build', 'connect:test', 'jasmine']
      }
    },
    concurrent: {
      dev: {
        tasks: ['watch', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    jasmine: {
      src: 'champion.js',
      options: {
        host: 'http://127.0.0.1:8000',
        specs: 'test/spec/*.js',
        vendor: [
          'test/vendor/sinon/sinon.js', 
          'test/vendor/chai/chai.js', 
          'test/vendor/jquery/jquery.js'
        ],
        helpers: [
          'test/helpers/sinon-chai/sinon-chai.js',
          'test/helpers/jasmine-jquery/jasmine-jquery.js',
          'test/helpers/chai-jquery/chai-jquery.js',
          'test/helpers/history-shim/history-shim.js'
        ],
        outfile: 'test/_SpecRunner.html',
        keepRunner: true
      }
    },
    copy: {
        build: {
            files: [
                { expand: true, src: '<%= pkg.name %>.js', dest: 'test-app/app/scripts' }
            ]
        }
    },
    connect: {
      test: {
        options: {
          hostname: '127.0.0.1',
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('build', ['concat:build', 'uglify:build', 'copy:build']);
  grunt.registerTask('start', ['concurrent']);
};