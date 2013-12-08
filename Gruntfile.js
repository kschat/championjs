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
					'src/util/*.js',
					'src/event.js',
					'src/router.js',
					'src/view.js',
					'src/model.js',
					'src/presenter.js'
				],
				dest:
                    '<%= pkg.name %>.js'
			},
			options: {
				banner: '/*\n' +
						' *\t<%= pkg.name %>.js - <%= pkg.version %>\n' +
						' *\tContributors: ' + '<%= pkg.contributors[0].name %>, <%= pkg.contributors[1].name %>\n' +
						' *\tDescription: <%= pkg.description %>\n' + 
						' *\tSource: <%= pkg.repository.url %>\n' + 
						' *\tChampion may be freely distributed under the <%= pkg.license %> license\n' +
						' */\n\n' +
						';(function($, undefined) { \n\t\'use strict\';\n\n',
				footer: '\n\n}).call(this, jQuery);',
				separator: '\n\n',
				//Adds the file name in a comment before the module and properly tabs the code
				process: function(src, filepath) {
					return '\t// Source: ' + filepath + '\n' +
						src.replace(/^/gm, '\t');
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
				tasks: ['concat:build', 'jasmine']
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
				specs: 'test/spec/*.js',
				vendor: [
					'test/vendor/sinon/sinon.js', 
					'test/vendor/chai/chai.js', 
					'test/vendor/sinon-chai/sinon-chai.js',
					'test/vendor/jquery/jquery.js'
				],
				outfile: 'test/_SpecRunner.html',
				keepRunner: true
			}
		},
        copy: {
            build: {
                files: [
                    {expand: true, src: '<%= pkg.name %>.js', dest: 'test-app/app/scripts'}
                ]
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

	grunt.registerTask('test', ['jasmine']);
	grunt.registerTask('build', ['concat:build', 'uglify:build', 'copy:build']);
	grunt.registerTask('start', ['concurrent']);
};