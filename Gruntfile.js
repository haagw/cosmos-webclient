module.exports = function(grunt) {
	"use strict";

	// Project configuration.
	grunt.initConfig({
		
		openui5preload: {

			component: {
				options: {
					resources: {
						cwd: "webapp",
						prefix: "webclient"
					},
					dest: "dist"
				},
				components: "webclient"
			}

		},
		uglify: {
			options: {
				mangle: true,
				compress: {
					drop_console: true,
					dead_code: false,
					unused: false
				}
			},
			files: {
				expand: true,
				cwd: "<%= ref.staging%>",
				src: ["**/*.js", "!test/**", "!test_local.html"],
				dest: "<%= ref.process%>"
			}
		}
	});
	grunt.loadNpmTasks("grunt-openui5");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.registerTask("default", [
		//"clean",
		//"lint",
		//"build",
		//"uglify"
		"openui5preload"
	]);
};