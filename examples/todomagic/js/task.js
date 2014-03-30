
(function(exports) {
  'use strict';
  var Task = function(app, taskData) {
    this.setup();
    this.states.id = Date.now();
    this.app = app;
    this.requestRegister();

    // To use closure to apply the data at the future.
    this.requestCanvas((canvas) => {
      if (taskData) {
        this.load(taskData);
      }
      this.onCanvas();
    });
  };

  Task.prototype.handleEvent = function(evt) {
    switch(evt.type) {
      case 'click':
        if (this.elements.toggle === evt.target) {
          this.toggle();
        }
        break;
    }
  };

  Task.prototype.setup = function() {
    this.app = null;
    this.states = {
      id: '',
      content: '',
      date: ''
    };
    this.configs = {
      'template': '<span data-role="button-toggle"></span>' +
                  '<span data-role="content">%CONTENT</span>'
    };
    this.elements = {
      'canvas': null,
      'toggle': null,   // The toggle button
    };
  };

  Task.prototype.load = function(data) {
    this.states.id = data.id;
    this.states.content = data.content;
    this.states.date = data.date;
  };

  Task.prototype.requestRegister = function() {
    this.app.request('task-request-register', {
      'id': this.states.id, 'task': this });
  };

  Task.prototype.requestCanvas = function(response) {
    this.app.request('task-request-canvas', {}, response);
  };

  Task.prototype.render = function() {
    var dummy = document.createElement('div'),
        html = this.configs.template
                .replace('%CONTENT', this.states.content)
                .replace('%DATE', this.states.date);

    dummy.innerHTML = html;
    var toggle = dummy.firstElementChild,
        content = dummy.lastElementChild;
    this.canvas.appendChild(toggle);
    this.canvas.appendChild(content);
    toggle.addEventListener('click', this);
  };

  Task.prototype.onCanvas = function(canvas) {
    this.elements.canvas = canvas;
    this.render();
  };

  Task.prototype.toggle = function() {
    this.states.toggle = (this.states.toggle) ? false : true;
    this.canvas.classList.toggle('done');
  };

  Task.prototype.request = function(type, detail, response) {
    switch(type) {
      case 'app-exports':
        var pod = {
          'id': this.states.id,
          'content': this.states.content,
          'date': this.states.date
        };
        response(this.states.id, pod);
        break;
    }
  };

  /** @global Task */
  exports.Task = Task;
})(window);
