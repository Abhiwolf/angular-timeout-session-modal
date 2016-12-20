angular.module('timeoutSession', [])
// session expired modal pop-up based on ajax call
    .controller('sessionExpiredModalCtrl', function ($scope, CustomerDataService, $rootScope) {
        $scope.openSessionExpiredModal = function () {
            CustomerDataService.getCustomerInfo(function (response) {
                $scope.checkStatus = response.IsSuccessful();
            });
        };

    })

    //session refresh modal pop-up
    .controller('sessionRefreshCtrl', function ($scope, $window, $timeout, $uibModal, $rootScope) {
        var sessionRefreshModal;
        var whenHideOrMinizeHappen;
        var visiblePageCounter;
        var getWindowHiddenTimer;
        var totalMiliseconds;
        var getWindowHiddenCounter = 0;
        var getVisibilityPageTimer;
        var checkHiddenTimerValue = 1;
        $scope.checkContinueButtonClickEvent = false;
        $rootScope.changeContinueButtonClickEventValue = function(newVal) {
            $scope.checkContinueButtonClickEvent = newVal;
        };
        $rootScope.changeHiddenTimerValue = function(){
           checkHiddenTimerValue = 1;   
        };
        
        $window.onload = function () {
            sessionRefreshModal = $timeout($rootScope.callAtTimeout, servertimeoutCounter);
                //counting page visibility time 
                visiblePageCounter = 0;
                $scope.getTimeoutCounter = function(){
                    visiblePageCounter++;
                    console.log(visiblePageCounter);
                    getVisibilityPageTimer = $timeout($scope.getTimeoutCounter, 1000);
                };
                getVisibilityPageTimer = $timeout($scope.getTimeoutCounter, 1000); 
        };
        
    // Set the name of the hidden property and the change event for visibility
        var hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
          hidden = "hidden";
          visibilityChange = "visibilitychange";
        } else if (typeof document.mozHidden !== "undefined") {
          hidden = "mozHidden";
          visibilityChange = "mozvisibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
          hidden = "msHidden";
          visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
        }
        
        //execute this function when user minimize or hide the app or return the same app 
        function handleVisibilityChange() {
            //when app is hide 
          if (document[hidden]) {
                getWindowHiddenCounter = 0;
                $timeout.cancel(sessionRefreshModal);
                $timeout.cancel(getVisibilityPageTimer);
                $timeout.cancel(whenHideOrMinizeHappen);
                $scope.callVisibilityTimeout = function () {
                    getWindowHiddenCounter++;
                    console.log(getWindowHiddenCounter);
                    getWindowHiddenTimer = $timeout($scope.callVisibilityTimeout, 1000); 
                };
                getWindowHiddenTimer = $timeout($scope.callVisibilityTimeout, 1000);
          } else {
                $timeout.cancel(getWindowHiddenTimer);
                $timeout.cancel(sessionRefreshModal);
                if(getWindowHiddenCounter > 0){
                    $timeout.cancel($scope.timerContinueClick);
                    if($scope.checkContinueButtonClickEvent){
                        totalMiliseconds = parseInt(servertimeoutCounter)- parseInt(getWindowHiddenCounter*1000);
                    }else{
                        if(checkHiddenTimerValue < 2){
                            checkHiddenTimerValue++;
                            totalMiliseconds = parseInt(servertimeoutCounter)- parseInt((visiblePageCounter*1000)+ (getWindowHiddenCounter*1000));
                            console.log("Hidden first time :" +totalMiliseconds);
                        }else{
                            totalMiliseconds = parseInt(totalMiliseconds)-parseInt((visiblePageCounter*1000)+ (getWindowHiddenCounter*1000));
                            console.log("Hidden more than one :" +totalMiliseconds);
                        }
                    }
                    whenHideOrMinizeHappen =  $timeout($rootScope.callAtTimeout, totalMiliseconds);
                    $scope.checkContinueButtonClickEvent = false;
                    visiblePageCounter = 0;
                    getVisibilityPageTimer = $timeout($scope.getTimeoutCounter, 1000);
                }else{
                    $scope.checkContinueButtonClickEvent = false;
                    $timeout.cancel(whenHideOrMinizeHappen);
                    visiblePageCounter = 0;
                    getVisibilityPageTimer = $timeout($scope.getTimeoutCounter, 1000);   
                }
            }
        };

        // Warn if the browser doesn't support addEventListener or the Page Visibility API
        if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
          alert("It is not supported browser for hidden/visibility");
        } else {
          // Handle page visibility change   
          document.addEventListener(visibilityChange, handleVisibilityChange, false);

        }
    // End functionality of hidden property and the change event for visibility
        
        $scope.animationsEnabled = true;
        $rootScope.callAtTimeout = function () {
            $timeout.cancel(getVisibilityPageTimer);
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'sessionRefreshTimerModal.html',
                controller: 'sessionRefreshPopupCtrl',
                backdrop: 'static',
                backdropClass: 'modal-backdrop h-full',
                size: 'sm'
            });
            $timeout.cancel($scope.timerContinueClick);
        };
        
    })

    .controller('sessionRefreshPopupCtrl', function ($scope, $uibModal, $uibModalInstance, $timeout, $rootScope, CheckSessionService, $interval, $window) {
        $scope.showSessionWaitMsg = false;
        var sessionCheckHitCounter = 0;
        var maxSessionCheckHitCounter = 33;

        // showing timer on modal pop-up
        $scope.sessionRefreshCounter = (countDownTimer) / 1000;
        $scope.onTimeout = function () {
            if ($scope.sessionRefreshCounter === 0) {
                if($rootScope.IsResidential){
                    $window.location.href = '/billpay/saml/logout?local=true';
                }else{
                    $window.location.href = '/billpay/saml/logout?local=true&user=bus';
                }
                return;
            } else {
                $scope.sessionRefreshCounter--;
            }
            mytimeout = $timeout($scope.onTimeout, 1000);
        };
        
        var mytimeout = $timeout($scope.onTimeout, 1000);
        
        //Function will execute user session service
        function getSessionRefresh(getSessionTruecallback) {
            //calling this service for checking user session
            CheckSessionService.getCheckSessionApi(function (response) {
                $scope.checkUserSession = response.data.session;
                $timeout(function() {
                    delete $window.onbeforeunload;
                },100);
                if (getSessionTruecallback) {
                    getSessionTruecallback();
                }
            });
        }
        getSessionRefresh();
        
         //This function will execute when user session is true
        function getSessionTruecallback(){
            if($scope.checkUserSession === true){
                $scope.disableContinueBtn = false;
                $uibModalInstance.dismiss('cancel');
                // Reset the timer for next session timeout popup
                $rootScope.timerContinueClick = $timeout($scope.callAtTimeout, servertimeoutCounter);
            }else{
                if(sessionCheckHitCounter >= maxSessionCheckHitCounter){
                    $interval.cancel($scope.refreshSessionTimer);
                    if($rootScope.IsResidential){
                        $window.location.href = '/billpay/saml/logout?local=true';
                    }else{
                        $window.location.href = '/billpay/saml/logout?local=true&user=bus';
                    }
                }
            }
        }
        
        // timeout modal continue button functionality
        $scope.sessionRefreshOperation = function () {
            $scope.changeContinueButtonClickEventValue(true);
            $scope.changeHiddenTimerValue();
            $timeout.cancel(mytimeout);
            // open refreshsession modal pop-up
            if($rootScope.IsResidential){
                $window.open("/billpay/refreshsession", "_blank");
                $scope.showSessionWaitMsg = true;
            }else{
                $window.open("/billpay/refreshsession?user=bus", "_blank");
                $scope.showSessionWaitMsg = true;
            }

            //checking user session
            if($scope.checkUserSession === true){
                getSessionTruecallback();

            }else {
                $scope.disableContinueBtn = true;
                $scope.refreshSessionTimer = $interval(function(){
                    sessionCheckHitCounter++;
                    $scope.checkUserSession === false ? getSessionRefresh(getSessionTruecallback) : "";
                }, 2000);
            }
        };
    })
