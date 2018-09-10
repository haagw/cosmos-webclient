module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		
		dir: {
			webapp: "webapp",
			dist: "target/webapp"
		},
		
		connect: {
			options: {
				port: 3000,
				hostname: "*"
			},
			src: {},
			dist: {}
		},
		
		openui5_connect: {
			options: {
				resources: [
					"target/webjars/META-INF/resources/webjars/openui5/1.56.5"
				],
				testresources: [
					"target/webjars/META-INF/resources/webjars/openui5/1.56.5"
				],
				cors: {
					origin: "http://localhost:<%= karma.options.port %>"
				}
			},
			src: {
				options: {
					appresources: "<%= dir.webapp %>"
				}
			},
			dist: {
				options: {
					appresources: "<%= dir.dist %>"
				}
			}
		},
		
		clean: {
			dist: "<%= dir.dist %>",
			coverage: "target/coverage"
		},
		
		"regex-replace": {
			manifest: {
				src: ["<%= dir.dist %>/manifest.json"],
				actions: [
					{
						name: "cosmosWebApi",
						search: "http.*cosmos-webapi",
						replace: "/cosmos-webapi"
					},{
						name: "cosmosWebAuth",
						search: "http.*cosmos-webauth",
						replace: "/cosmos-webauth"
					}
				]
			},
			index: {
				src: ["<%= dir.dist %>/index.html"],
				actions: [
					{
						name: "openUI5Resources",
						search: "/resources/sap-ui-core.js",
						replace: "webjars/openui5/1.56.5/sap-ui-core.js"
					},
					{
						name: "logLevel",
						search: "data-sap-ui-logLevel=\"DEBUG\"",
						replace: "data-sap-ui-logLevel=\"INFO\""
					}
					
				]
			}
			
		},
		
		eslint: {
			target: ["<%= dir.webapp %>"]
		},
		
		copy : {
			main: {
				files:[
					{	
						expand : true,
						cwd: "<%= dir.webapp %>/",
						src: ["**/*.json", "**/*.html", "*.ico", "**/*.css", "image/**", "i18n/**", "!test/**"], 
						dest: "<%= dir.dist %>"
					},
										{	
						expand : true,
						cwd: "./",
						src: ["WEB-INF/web.xml"], 
						dest: "<%= dir.dist %>"
					}
				]
			}
		},
		
		karma: {
			options: {
				basePath: "<%= dir.webapp %>",
				frameworks: ["openui5", "qunit"],
				openui5: {
					path: "http://localhost:3000/target/webjars/META-INF/resources/webjars/openui5/1.56.5/sap-ui-core.js"
				},
				client: {
					openui5: {
						config: {
							theme: "sap_belize",
							bindingSyntax: "complex",
							compatVersion: "edge",
							preload:"async",
							resourceroots: {"com.oce.cosmos": "./"}
						}
					}
				},
				files: [
					{ pattern: "test/karma-main.js", included: true,  served: true, watched: true },
					{ pattern: "**",                 included: false, served: true, watched: true }
				],
				proxies: {
					"/base/resources": "http://localhost:3000/target/webjars/META-INF/resources/webjars/openui5/1.56.5",
					"/base/test-resources": "http://localhost:3000/test-resources"
				},
				reporters: ["progress"],
				port: 9876,
				logLevel: "INFO",
				browsers: ["Chrome"]
			},
			ci: {
				singleRun: true,
				browsers: ["PhantomJS"],
				preprocessors: {
					"{<%= dir.webapp %>,<%= dir.webapp %>/!(test)}/*.js": ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					reporters: [
						{
							type: "html",
							dir: "../target/coverage/"
						},
						{
							type: "text"
						}
					],
					check: {
						each: {
							statements: 100,
							branches: 100,
							functions: 100,
							lines: 100
						}
					}
				},
				reporters: ["progress", "coverage"]
			},
			watch: {
				client: {
					clearContext: false,
					qunit: {
						showUI: true
					}
				}
			},
			
			coverage: {
				singleRun: true,
				browsers: ["PhantomJS"],
				preprocessors: {
					"{<%= dir.webapp %>,<%= dir.webapp %>/!(test)}/*.js": ["coverage"]
				},
				coverageReporter: {
					includeAllSources: true,
					reporters: [
						{
							type: "html",
							dir: "../target/coverage/"
						},
						{
							type: "text"
						}
					]
				},
				reporters: ["progress", "coverage"]
			}
		},

		openui5_preload: {
			component: {
				options: {
					resources: {
						cwd: "<%= dir.webapp %>",
						prefix: "com/oce/cosmos",
						src: [
							"**/*.js",
							"**/*.fragment.xml",
							"**/*.view.xml",
							//"**/*.properties",
							"!test/**"
						]
					},
					dest: "<%= dir.dist %>"
				},
				components: true,
				compress: true
			}
		}

	});
	
	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-connect");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-regex-replace");
	grunt.loadNpmTasks("grunt-eslint");
	grunt.loadNpmTasks("grunt-openui5");
	grunt.loadNpmTasks("grunt-karma");
	
	// Linting Task
	grunt.registerTask("lint", ["eslint"]);
	//Serve Task, serves the project in a http server
	grunt.registerTask("serve", function(target) {
		grunt.task.run("openui5_connect:" + (target || "src") + ":keepalive");
	});
	// Test tasks
	grunt.registerTask("test", ["clean:coverage", "openui5_connect:src", "karma:ci"]);
	grunt.registerTask("watch", ["openui5_connect:src", "karma:watch"]);
	grunt.registerTask("coverage", ["clean:coverage", "openui5_connect:src", "karma:coverage"]);
	
	// Default Task, builds the cosmos-webclient
	grunt.registerTask("default", [
		"clean:dist",
		"eslint",
		"copy",
		"openui5_preload",
		"regex-replace:manifest",
		"regex-replace:index"
	]);
};