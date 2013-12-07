module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			dist: {
				src: '<%= pkg.name %>.js',
				dest: '<%= pkg.name %>.min.js'
			}
		},
		concat: {
			dist: {
				src: [
					'src/champion.js',
					'src/util/*.js',
					'src/event.js',
					'src/router.js',
					'src/view.js',
					'src/model.js',
					'src/presenter.js'
				],
				dest: '<%= pkg.name %>.js',
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
			// testApp: {
			// 	files: ['test-app/**/*', 'src/*.js'],
			// 	tasks: ['browserify:dev', 'concat:dev']
			// },
			test: {
				files: ['src/src/**/*.js', 'test/spec/**/*.js'],
				tasks: ['jasmine']
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
			src: 'src/src/*.js',
			options: {
				specs: 'test/spec/*.js',
				vendor: [
					'node_modules/sinon/pkg/sinon.js', 
					'node_modules/chai/chai.js', 
					'node_modules/sinon-chai/lib/sinon-chai.js'
				],
				outfile: 'test/_SpecRunner.html',
				keepRunner: true
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-jasmine');

	grunt.registerTask('test', ['watch:test']);
	grunt.registerTask('start', ['concurrent']);
	grunt.registerTask('deploy', ['env:prod', 'browserify:all', 'uglify', 'sass:prod']);
};