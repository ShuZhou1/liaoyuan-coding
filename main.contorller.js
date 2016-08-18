(function () {
    angular
        .module('TaxCalApp')
        .controller('MainController', MainController);

    function MainController(MainService, $q) {
        console.log("MainController");
        var vm = this;
        vm.employees = [];
        vm.curEmployee = {"name":"","salary":"","level":"","rate":""};
        vm.calSingleTax = calSingleTax;
        vm.uploadCSV = uploadCSV;
        vm.cleanEmployeeList = cleanEmployeeList;


        //init to get related parameters
        function init() {
            MainService.getpersonrates().then(function(response){
                if(response!=null){
                    vm.personrates = JSON.parse(response);
                    console.log(vm.personrates);
                }
            });
            MainService.getlevelsalary().then(function(response){
                if(response!=null){
                    vm.levelsalary = JSON.parse(response);
                    console.log(vm.levelsalary);
                }
            });
            MainService.getinsurancerates().then(function(response){
                if(response!=null){
                    vm.insurancerates = JSON.parse(response);
                    console.log(vm.insurancerates);
                }
            });
            MainService.getaversalary().then(function(response){
                if(response!=null){
                    vm.aversalary =JSON.parse(response);
                    console.log(vm.aversalary);
                }
            });
        }
        init();

        //inside calculate details
        function calSingleTaxIn(curEmployeeInfo){
            var deferred = $q.defer();
            var res = {};

            res.rate = Number(curEmployeeInfo[Object.keys(curEmployeeInfo)[3]]);
            res.salary = Number(curEmployeeInfo[Object.keys(curEmployeeInfo)[1]]);
            res.name = curEmployeeInfo[Object.keys(curEmployeeInfo)[0]];
            res.level = curEmployeeInfo[Object.keys(curEmployeeInfo)[2]];


            if(res.salary > vm.aversalary[0].本市职工月平均工资 * 3) {
                res.tempsalary = vm.aversalary[0].本市职工月平均工资 * 3;
            } else if (res.salary < vm.aversalary[0].本市职工月平均工资 * 0.6) {
                res.tempsalary = vm.aversalary[0].本市职工月平均工资 * 0.6;
            } else {
                res.tempsalary = res.salary;
            }

            res.rewardmoney = parseInt(vm.levelsalary[0][res.level]);
            console.log(vm.levelsalary[0]);


            res.personalyanglao = Number((vm.insurancerates[1].养老保险 * res.tempsalary)).toFixed(2);
            res.personalyiliao = Number((vm.insurancerates[1].医疗保险 * res.tempsalary)).toFixed(2);
            res.personalshiye = Number((vm.insurancerates[1].失业保险 * res.tempsalary)).toFixed(2);
            res.personalshengyu = Number((vm.insurancerates[1].生育保险 * res.tempsalary)).toFixed(2);
            res.personalgongshang = Number((vm.insurancerates[1].工伤保险 * res.tempsalary)).toFixed(2);
            res.personalzhufang = Number((res.rate * res.tempsalary)).toFixed(2);
            res.personaltotal =
                (Number(res.personalgongshang) + Number(res.personalshengyu) + Number(res.personalshiye) +
                Number(res.personalyanglao) + Number(res.personalyiliao) + Number(res.personalzhufang)).toFixed(2);

            res.companyyanglao = Number((vm.insurancerates[0].养老保险 * res.tempsalary)).toFixed(2);
            res.companyyiliao = Number((vm.insurancerates[0].医疗保险 * res.tempsalary)).toFixed(2);
            res.companyshiye = Number((vm.insurancerates[0].失业保险 * res.tempsalary)).toFixed(2);
            res.companyshengyu = Number((vm.insurancerates[0].生育保险 * res.tempsalary)).toFixed(2);
            res.companygongshang = Number((vm.insurancerates[0].工伤保险 * res.tempsalary)).toFixed(2);
            res.companyzhufang = Number((res.rate * res.tempsalary)).toFixed(2);
            res.companytotal =
                (Number(res.companygongshang) + Number(res.companyshengyu) + Number(res.companyshiye) +
                Number(res.companyyanglao) + Number(res.companyyiliao) + Number(res.companyzhufang)).toFixed(2);

            res.befortax = (res.salary + res.rewardmoney - res.personaltotal).toFixed(2);
            var needpt = res.befortax - 3500;
            var result = 0;
            if (needpt > 0) {
                if (needpt > 80000) {
                    result = 1500 * vm.personrates[0][0] + 3000 * vm.personrates[0][1500] + 4500 * vm.personrates[0][4500]
                        + 26000 * vm.personrates[0][9000] + 20000 * vm.personrates[0][35000] + 25000 * vm.personrates[0][55000]
                        + (needpt - 80000) * vm.personrates[0][80000];
                } else if (needpt > 55000 && needpt < 80000) {
                    result = 1500 * vm.personrates[0][0] + 3000 * vm.personrates[0][1500] + 4500 * vm.personrates[0][4500]
                        + 26000 * vm.personrates[0][9000] + 20000 * vm.personrates[0][35000] + (needpt - 55000) * vm.personrates[0][55000];
                } else if (needpt > 35000 && needpt < 55000) {
                    result = 1500 * vm.personrates[0][0] + 3000 * vm.personrates[0][1500] + 4500 * vm.personrates[0][4500]
                        + 26000 * vm.personrates[0][9000] + (needpt - 35000) * vm.personrates[0][35000];
                } else if (needpt > 9000 && needpt < 35000) {
                    result = 1500 * vm.personrates[0][0] + 3000 * vm.personrates[0][1500] + 4500 * vm.personrates[0][4500]
                        + (needpt - 9000) * vm.personrates[0][9000];
                } else if (needpt > 4500 && needpt < 9000) {
                    result = 1500 * vm.personrates[0][0] + 3000 * vm.personrates[0][1500] + (needpt - 4500) * vm.personrates[0][4500];
                } else if (needpt > 1500 && needpt < 4500) {
                    result = 1500 * vm.personrates[0][0] + (needpt - 1500) * vm.personrates[0][1500];
                } else {
                    result = needpt * vm.personrates[0][0];
                }
            } else {
                result = 0;
            }
            res.personaltax = result.toFixed(2);
            res.aftertax = (res.befortax - res.personaltax).toFixed(2);


            console.log(res);
            deferred.resolve(res);
            return deferred.promise;

        }

        //calculate single employee details
        function calSingleTax(){
            calSingleTaxIn(vm.curEmployee).then(
                function (data) {
                    if (data == null) {
                        alert("表单无数据!");
                    } else {
                        var temp = $.extend(true, {}, data);
                        console.log(vm.curEmployee);
                        vm.employees.push(temp);
                        console.log(vm.employees);
                    }
                });
        }

        //parse uploading file
        function uploadCSV(){
            var fileUrl = document.getElementById("my-file-selector").files[0];
            console.log(fileUrl);

            if(fileUrl) {
                Papa.parse(fileUrl, {
                    complete: function(results) {
                        vm.nameList = results.data;
                        console.log(vm.nameList);
                        for (var i = 1; i < vm.nameList.length; i++){
                            var one = {"name":vm.nameList[i][0],"salary":vm.nameList[i][1],"level":vm.nameList[i][2],"rate":vm.nameList[i][3]};
                            console.log(one);
                            calSingleTaxIn(one).then(
                                function (data) {
                                    if (data == null) {
                                        alert("表单无数据!");
                                    } else {
                                        var temp = $.extend(true, {}, data);
                                        console.log(vm.curEmployee);
                                        vm.employees.push(temp);
                                        console.log(vm.employees);
                                    }
                                });
                        }
                        alert("上传成功");
                    }
                });
            } else {
                alert("上传失败!");
            }
        }

        //clean table
        function cleanEmployeeList() {
            vm.employees = [];
        }
    }
})();