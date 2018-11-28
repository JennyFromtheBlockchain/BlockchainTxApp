// Gruntfile.js

module.exports = (grunt) => {
  grunt.initConfig({
    execute: {
      target: {
        src: ['server/server.js']
      }
    },
    watch: {
      scripts: {
        files: ['server/server.js'],
        tasks: ['execute'],
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-execute');
};
