
(function(exports) {
  'use strict';

  /**
   * @constructor App
   */
  var App = function() {
    this.setup();
  };

  /**
   * Setup this instance.
   *
   * @this {App}
   * @memberof App
   */
  App.prototype.setup = function() {
    this.elements = {
      'tool-newtask': null
    };
    this.tasks = {};
    this.states = {};
    this.configs = {};
  };

  App.prototype.handleEvent = function(evt) {
    switch (evt.type) {
      case 'click':
        if (this.elements['tool-newtask'] === evt.target) {
          this.onNewTask();
        }
        break;
    }
  };

  /**
   * Would start to listen events.
   *
   * @this {App}
   * @memberof App
   */
  App.prototype.startListenEvents = function() {
    this.configs.events.forEach((etype) => {
      window.addEventListener(etype, this);
    });
  };

  /**
   * Create a new task while the corresponding event got triggered.
   *
   * @this {App}
   * @memberof App
   */
  App.prototype.onNewTask = function() {
    this.createTask();
  };

  /**
   * From Tasks and other data to POD object.
   *
   * @this {App}
   * @memberof App
   */
  App.prototype.exports = function() {
    var appPod = {tasks: {}},
        response = (taskID, taskPod) => {
          appPod.tasks[taskID] = taskPod;
        },
        done = () => {
          return appPod;
        };
    return this.broadcast();
  };

  /**
   * Reset this app from the POD object.
   *
   * @param {object} data - see `export` method to get the detail spec.
   * @this {App}
   * @memberof App
   */
  App.prototype.imports = function(data) {
    Object.keys(data.tasks).forEach((taskData) => {
        var task = this.createTask(taskData);
    });
  };

  /**
   * Save the tasks to local storage.
   *
   * @this {App}
   * @memberof App
   */
  App.prototype.save = function() {
    var serialized = JSON.stringify(this.exports());
    window.localStorage.set(this.configs.storageEntry, serialized);
  };

  /**
   * Load the tasks from local storage.
   *
   * @return {boolean} - if loading success, return true.
   * @this {App}
   * @memberof App
   */
  App.prototype.load = function() {
    var pod = window.localStorage.get(this.configs.storageEntry);
    if (null === pod) {
      return false;
    }
    this.imports(pod);
    return true;
  };

  /**
   * Create a task.
   *
   * @param {object} taskData - (optional) if it exists, would crate a task
   *                            according to it.
   * @return {Task}
   * @this {App}
   * @memberof App
   */
  App.prototype.createTask = function(taskData) {
    return new Task(this, taskData);
  };

  /**
   * Broadcast to all tasks. Note it is synchronous
   *
   * @param {string} type
   * @param {object} detail
   * @param {function} response - (optional) if set, tasks would call this
   *                              to response
   * @param {function} done - (optional) call it when all tasks had responsed,
   *                          which would become this function's return value
   * @return any - undefined if no `done`; any if done would return something
   * @this {App}
   * @memberof App
   */
  App.prototype.broadcast = function(type, detail, response, done) {
    Object.keys(this.tasks).forEach((taskID) => {
      tasks[taskID].request(type, detail, response);
    });
    if (done) {
      return done();
    }
  };

  /**
   * To let tasks call this method to request some resources.
   *
   * @param {string} type
   * @param {object} detail
   * @param {function} response - (optional) if set, would call this
   *                              to response
   * @this {App}
   * @memberof App
   */
  App.prototype.request = function(type, detail, response) {
    switch (type) {
      // Return a new task canvas to let the task to draw itself.
      case 'task-reqeust-canvas':
        var canvas = document.createElement('li');
        response(canvas);
        break;
    }
  };

  /** @global App */
  exports.App = App;
})(window);
