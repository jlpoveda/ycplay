function TodoCtrl($scope) {
  $scope.todos = [
    {text:'learn angular', done:true, id:1},
    {text:'build an angular app', done:false, id:2}];
 
  $scope.addTodo = function() {
    $scope.todos.push({text:$scope.todoText, done:false, id:$scope.todos.length+1});
    $scope.todoText = '';
  };
 
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };
 
  $scope.archive = function() {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });
  };
}