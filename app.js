/*** Concept flow ***
 * 
// var BudgetController = (function(){

//     var x = 10;
    
//     var add = function(b){
//         return b + x;
//     }

//     return {
//         publicTest: function(b){
//             return add(b);
//         }
//     }

// })();

// var Controller = (function(BudgetCtrl,UICtrl){

//     var z = BudgetCtrl.publicTest(5);

//     return {
//         controller: function(){
//             return z;
//         }
//     }

// })(BudgetController,UIController);
 
/*** Concept flow ***/

/* Budgety App */


var BudgetController = (function(){   //IIFE

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(totalIncome){
        
        console.log(this.value)
        if(totalIncome > 0){
             this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){
        console.log(this.percentage);
        return this.percentage;
        
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems : {
            inc : [],
            exp : []
        },
        total : {
            inc : 0,
            exp : 0
        },
        budget : 0,
        percentage : -1

    };

    var calculateTotalIncExp= function(type){
        var sum = 0;
        data.allItems[type].forEach( function(cur) {
            sum += cur.value;
        });
        data.total[type] = sum;
    };

    return {
        //public 
        addItem: function(type,description,value){
            var newItem, ID;
            // 1 2 3 4 5 =>next ID => 6
            // 1 3 5 7 8 12 => next ID => 13
            // id = last ID + 1

            // create new ID
            if(data.allItems[type].length > 0){ 
                ID = data.allItems[type][data.allItems[type].length -1].id + 1; 
            }else{
                ID = 0;
            }
            console.log(ID);

            //create new item based on inc or dec
            if(type === 'inc'){
                newItem = new Income(ID,description,value);
            }else if(type === 'exp'){
                newItem = new Expense(ID,description,value);
            }
            //push it to our data structure
            data.allItems[type].push(newItem);
            //return newItem for easily access from other module or function to use direct 
            return newItem;
        },

        calculateBudget: function(){
            
            // calculate total inc/Exp
            calculateTotalIncExp('inc');
            calculateTotalIncExp('exp');

            // calculate the total Budget
            data.budget = data.total.inc - data.total.exp;

            // Total Expense Percentage based on total income   
            if(data.total.inc > 0){
                data.percentage = Math.round((data.total.exp / data.total.inc ) * 100);
            }else
            {
                data.percentage = -1;
            }

        },

        returnBudget: function(){
            return{
                budget     : data.budget,
                totalInc   : data.total.inc,
                totalExp   : data.total.exp,
                percentage : data.percentage
            }
        },

        calculatePercentages: function() {
            //exp 1 : 10
            //exp 2 : 35
            //exp 3 : 500
            //totalIncome : 1000

            // percentage = (exp / totalIncome)*100 
            //exp 1 => 1%
            //exp 2 => 3.5%
            //exp 3 => 50%

            data.allItems.exp.forEach(cur =>{
                return cur.calculatePercentage(data.total.inc);
            })
        },

        returnPercentages: function(){
            var allPercentages = data.allItems.exp.map(cur => { 
                return cur.getPercentage();
            });
            return allPercentages;
        },

        deleteItemByID: function(type,id){   

            // del => id 6 => index => 3
            // [1 2 4 6 8 ]
           
            var ids, index;

            ids = data.allItems[type].map(cur => {  // map function => return brand new array
                return cur.id; //exact same new array
            })

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index,1); // splice(starting position, del numb)
            }
        },

        testing: function(){
            console.log(data);
            
            // console.log(this.returnBudget());
        }
    }


})();


var UIController = (function(){
    //private place
    var DOMStrings = {

        getMonthYear        : ".budget_title_month",
        getTotalBalance     : ".budget_balance",
        getIncValue         : ".budget_income_value",
        getExpValue         : ".budget_expense_value",
        getExpPercentage    : ".budget_expense_percentage",
        getType             : ".add_type",
        getDesc             : ".add_description",
        getValue            : ".add_value",
        getInputBtn         : ".add_btn",
        getContainer        : ".container",
        getItemDeleteBtn    : ".item__delete--btn",
        getExpListPercentage: ".item__percentage",
        getIncList          : ".income__list",
        getExpList          : ".expenses__list" 
    }

    var nodeListForEach = function(list,callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i],i);
        }
    }

    var formatNumber = function(num,type){
        var num, splitNum, int, dec;
        
        num = Math.abs(num);
        num = num.toFixed(2); //2310.4567 => "2310.46" , 2000 => "2000.00" return String

        splitNum = num.split('.'); // ["2310","46"]

        int = splitNum[0]; //"2310"
        dec = splitNum[1]; //"46"
       
        if(int.length > 3){ //2,310 ,23,100
           int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp'? '-' : '+') + ' ' + int + '.' + dec;

    }

    return {

        //public place
        getDOMStrings : function(){
            return DOMStrings;// in order to public and can access or call by other controllers or modules
        },

        // get input text value
        getAddItem : function(){
            return {
                type : document.querySelector(DOMStrings.getType).value,
         description : document.querySelector(DOMStrings.getDesc).value,
               value : parseFloat(document.querySelector(DOMStrings.getValue).value)
            }
        },

        addNewItem: function(obj,type){
            var html, newHtml, element;

            if(type === 'inc'){
                element = DOMStrings.getIncList;

                // Replace the placeholder text with some actual data
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                newHtml = html.replace('%id%',obj.id);
                newHtml = newHtml.replace('%description%',obj.description);
                newHtml = newHtml.replace('%value%',formatNumber(obj.value));
                
                //insert into the DoM
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml); // after the last child 

            }else if(type === 'exp'){
                element = DOMStrings.getExpList;

                // Replace the placeholder text with some actual data
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                newHtml = html.replace('%id%',obj.id);
                newHtml = newHtml.replace('%description%',obj.description);
                newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
                
                //insert into the DoM
                document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            }
        },

        getReturnBudget : function(obj){
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.getTotalBalance).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.getIncValue).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.getExpValue).textContent = formatNumber(obj.totalExp,'exp');

            if(obj.totalExp > 0 ) {
                document.querySelector(DOMStrings.getExpPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.getExpPercentage).textContent = '---';
            }
        },

        getReturnPercentage: function(percentages){ //[50,60,70,10]
            var fields = document.querySelectorAll(DOMStrings.getExpListPercentage);
           
            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else
                {
                    current.textContent = '---';
                }
            })
        },

        deleteItemList: function(selectedID){
            var id;
            id = document.getElementById(selectedID);
            id.parentNode.removeChild(id);
        },

        displayDate: function(){
            var months, thisMonth, thisYear, todayDate;
            
            todayDate = new Date();
            thisMonth = todayDate.getMonth(); // 0 based => 12 months => 0 => 11,  jan => 0
            thisYear  = todayDate.getFullYear();

            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

            document.querySelector(DOMStrings.getMonthYear).textContent = `${months[thisMonth]} , ${thisYear}`;

        },

        changeInputUX: function(){
            var fields =  document.querySelectorAll(DOMStrings.getType + ',' + DOMStrings.getDesc + ',' + DOMStrings.getValue);
            console.log(fields)
            // return Nodelist(3)
            nodeListForEach(fields,function(cur){
                cur.classList.toggle("red-input");
            })

            document.querySelector(DOMStrings.getInputBtn).classList.toggle('red-btn');


        },

        clearField: function(){
            
            // document.querySelector(DOMStrings.getDesc).value = '';
            // document.querySelector(DOMStrings.getValue).value = '';
            // document.querySelector(DOMStrings.getDesc).focus();
             
            // same way upper and lower
            
            
            var field , fieldArr;
            
            field = document.querySelectorAll(DOMStrings.getDesc +' ,' + DOMStrings.getValue);

            fieldArr = Array.prototype.slice.call(field);

            fieldArr.forEach(function(cur,index,array) {
                cur.value = "";
            });

            fieldArr[0].focus();

        }
    }

 })();


 var AppController = (function(BudgetCtrl,UICtrl){
    // initialize state
    function setUpEventLister(){
        
        var DOMStrings = UICtrl.getDOMStrings();

        document.querySelector(DOMStrings.getInputBtn).addEventListener('click',ctrlAddItem); //doesnt need parenthese'()'here, call back function call when need instead of us
        
        document.querySelector(DOMStrings.getContainer).addEventListener('click',ctrlDeleteItem);

        document.querySelector(DOMStrings.getType).addEventListener('change',UICtrl.changeInputUX);

        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        })
    }

    // Event Listener

    function ctrlAddItem(){
        //get input data here
       var getAddItem = UICtrl.getAddItem();
    //    console.log(getAddItem)
       
       if(getAddItem.description != "" && !isNaN(getAddItem.value) && getAddItem.value > 0){
        
        // 2. add the item to the budget controller    
        var newItem = BudgetCtrl.addItem(getAddItem.type,getAddItem.description,getAddItem.value); 
        // console.log(newItem)

        //3. add the item to UI
        UICtrl.addNewItem(newItem, getAddItem.type);

        //4. clear the input in UI
        UICtrl.clearField();

        //5. update Budget
        updateBudget();

        //6. update Percentage
        updatePercentage();

        BudgetCtrl.testing();
    
        }
    }

    function ctrlDeleteItem(event){
        var itemID, splitID, type, id;
        // console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // console.log(typeof(itemID)); inc-0 => string
        if(itemID){
            
            splitID   =  itemID.split("-"); // inc-0 , inc-1 => split as string array => ["inc","1"] 
            type      =  splitID[0]; // [inc]
            id        =  parseInt(splitID[1]); // [1]
           
            // delete item from data structure
             BudgetCtrl.deleteItemByID(type,id);

            // delete item from UI
            UICtrl.deleteItemList(itemID);

            // update Budget
            updateBudget();

        }
    }

    // End Event Listener

    function updateBudget(){

        //1. calculate Budget
        BudgetCtrl.calculateBudget();

        //2. return Budget
        var returnBudget = BudgetCtrl.returnBudget();
        console.log(returnBudget);

        //3. display Budget in UI
        UICtrl.getReturnBudget(returnBudget);

    }

    function updatePercentage(){

        //1. Calculate Percentage
        BudgetCtrl.calculatePercentages();

        //2. Return Percentage
        var returnPercentage = BudgetCtrl.returnPercentages();
        console.log(returnPercentage); //return in array => [perc1,perc2,perc3,..]

        //3. display Percentage => UI
        UICtrl.getReturnPercentage(returnPercentage);
    }


    

    return {
        init: function(){
              // every function or obj within return are => public 
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.getReturnBudget({
                budget: 0,
                percentage : -1,
                totalExp: 0,
                totalInc: 0
            })
            setUpEventLister();
        }
    }


})(BudgetController,UIController);

AppController.init();
// BudgetController.testing();