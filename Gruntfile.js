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
          'src/extend.js',
          'src/guid.js',
          'src/module.js',
          'src/namespace.js',
          'src/ioc.js',
          'src/event.js',
          'src/view.js',
          'src/model.js',
          'src/presenter.js'
        ],

        dest: '<%= pkg.name %>.js'
      },

      options: {
        banner: grunt.file.read('src/intro.js'),

        footer: grunt.file.read('src/outro.js'),

        separator: '\n\n',

        //Adds the file name in a comment before the module and properly tabs the code
        process: function(src, filepath) {
          return '  // Source: ' + filepath + '\n' +
            src.replace(/^/gm, '  ');
        }
      }
    },

    watch: {
      test: {
        files: ['src/**/*.js', 'test/spec/**/*.js'],

        tasks: ['concat:build', 'jasmine']
      }
    },

    jasmine: {
      src: 'champion.js',

      options: {
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

    bump: {
      options: {
        updateConfigs: ['pkg'],
        commitMessage: '',
        commitFiles: ['-a'],
        pushTo: 'origin'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('test', ['jasmine']);
  grunt.registerTask('build', ['concat:build', 'uglify:build']);
  grunt.registerTask('run', ['watch:test']);
  grunt.registerTask('release', function(version) {
    grunt.task.run('bump-only:' + (version || 'patch'));
    grunt.task.run('build');
    grunt.task.run('bump:commit');
  });
};