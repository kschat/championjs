module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		// browserify: {
		// 	options: {
		// 		alias: [

		// 		]
		// 	},
		// 	test: {
		// 		src: 'test/spec/**/*.js',
		// 		dest: 'test/test.js'
		// 	}
		// },
		uglify: {
			build: {
				src: 'framework/src/*.js',
				dest: 'framework/build/<%= pkg.name %>.min.js'
			}
		},
		concat: {
			build: {
				src: 'framework/src/*.js',
				dest: 'framework/build/<%= pkg.name %>.js'
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
			// 	files: ['test-app/**/*', 'framework/*.js'],
			// 	tasks: ['browserify:dev', 'concat:dev']
			// },
			test: {
				files: ['framework/src/**/*.js', 'test/spec/**/*.js'],
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
			src: 'framework/src/*.js',
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

	//grunt.loadNpmTasks('grunt-browserify');
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