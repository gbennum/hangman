var hangman = angular.module('hangman', [])
.controller('mainController', function mainController($scope, $http) {
    $scope.wordData = {};
    resetCurtains();

    $http.get('/api/new-game')
        .success(function(data) {
            $scope.wordData = data;
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });

    $scope.checkGuess = function() {
        // Same up here
        if ($scope.current.guess !== '') {
            $scope.wordData.currentGuess = $scope.current.guess;
            $http.post('/api/check-guess', $scope.wordData)
                .success(function(data) {
                    $scope.wordData = data;
                    transformCurtains($scope.wordData.guesses);
                })
                .error(function(data) {
                    console.log('Error: ' + data);
                });
            }
    };

    $scope.newWord = function() {
        if ($scope.current) {
            $scope.current.guess = ''
        }
        // Might want to consider just sending the username, I don't think you need anything else
        $http.post('/api/new-word', $scope.wordData)
            .success(function(data) {
                $scope.wordData = data;
                resetCurtains();
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    $scope.loadUser = function(username) {
        $http.post('/api/load-user', $scope.wordData)
            .success(function(data) {
                $scope.wordData = data;
                resetCurtains();
                console.log($scope.wordData);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    function resetCurtains() {
        $scope.transformLeft = 'translateX(-100%)';
        $scope.transformRight = 'translateX(100%)';
    };

    function transformCurtains(numGuesses) {
        $scope.transformLeft = 'translateX(-' + ((10 - numGuesses) * 10).toString() + '%)';
        $scope.transformRight = 'translateX(' + ((10 - numGuesses) * 10).toString() + '%)'
    };

})
.directive('alphaOnly', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs, model) {
      element.on('keydown', function (event) {

        if (!isLetter(event.keyCode)) {
          /* Stop restricted keys */
          event.preventDefault();
          return false;
        }
        return true;
      });

      function isLetter(k) { return (k >= 65 && k <= 90) || k == 46 || k == 8; }
    }
  };
});