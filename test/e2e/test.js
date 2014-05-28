var expect = chai.expect;
var should = chai.should();
var webdriverjs = require('webdriverjs');


describe('E2E selenium tests', function() {
  this.timeout(30000);
  var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
  };
  var browserA,browserB;
  
  function startCheckpoint(numbersOfBrowsers, doneCallback){
    return {
      finish: function(){ if(--numbersOfBrowsers <= 0){ doneCallback() } }
    }
  }
    
  function drag(browser, element, x, y, offsetX, offsetY, times, callback){
    var val = browser.moveTo(element,x,y).buttonDown(0)
    var xstep = Math.floor(offsetX/times)
    var ystep = Math.floor(offsetY/times)
    
    for(var i = 0; i < times; i++) {
        val = val.moveTo(null,xstep,ystep)
    }
    val.moveTo(null,offsetX - xstep * times,offsetY - ystep * times).buttonUp(callback)
  }
  
  var dragElBy = function(element,offsetX,offsetY, cb){
      this.element(element,function(err,result){
        var times = 5;
        var val = this.moveTo(result.value.ELEMENT,5,5).buttonDown()
        var xstep = Math.floor(offsetX/times)
        var ystep = Math.floor(offsetY/times)
        for(var i = 0; i < times; i++) {
          val = val.moveTo(null,xstep,ystep)
        }
        val.buttonUp(cb)
      })
    }
  
  before(function(done){  
    var checkpoint = startCheckpoint(2,done)


    var driver1 = webdriverjs.remote(options);
    driver1.addCommand("dragBy", dragElBy)
    browserA = driver1
      .init()
      .url('http://localhost:1337/')
      .windowHandleMaximize(function(){checkpoint.finish()});
    
    var driver2 = webdriverjs.remote(options);
    driver2.addCommand("dragBy", dragElBy)
    browserB = driver2
      .init()
      .url('http://localhost:1337/')
      .windowHandleMaximize(function(){checkpoint.finish()});


  })

  it('should register and fail', function(done) {
    var checkpoint = startCheckpoint(1,done)
    
    browserA
      .setValue("input.signup-name", "Mieister Hendrich")
      .setValue("input.signup-email", "invalidEmail")
      .setValue("input.signup-password", "nininini")
      .setValue("input.signup-confirmation", "nininini")
      .click('input.signup-submit')
      .getText('.alert li', function(err,text){
        text.should.equal("invalid email, bro")
      })
      .setValue("input.signup-name", "Mieister Hendrich")
      .setValue("input.signup-email", "mieister@hendrich.com")
      .setValue("input.signup-password", "nininini")
      .setValue("input.signup-confirmation", "nininini")
      .click('input.signup-submit')
      .url(function(err, url){
        expect(url.value).to.contain("/user/show/");
      })
      .click('.logout-button',function(){checkpoint.finish()});
      

    //browserB
    //  .url('http://localhost:1337/')
    //  .setValue("input.login-user","user@user.fe.up.pt")
    //  .setValue("input.login-password","teste123")
    //  .click('button.login-submit')
    //  .click('//td[text() = "project miel picante"]/following-sibling::td/a[text() = "Join"]')
    //  .waitFor('.file-component.component', function(err){checkpoint.finish(err)})

  });

  
  
  it('should login two users and join the same project', function(done) {
    var checkpoint = startCheckpoint(2,done)
    
    browserA
      .setValue("input.login-user","admin@admin.pt")
      .setValue("input.login-password","admin123")
      .click('button.login-submit')
      .click('//td[text() = "project miel picante"]/following-sibling::td/a[text() = "Join"]')
      .waitFor('.command-component.component', function(){checkpoint.finish()})
      

    browserB
      .setValue("input.login-user","user@user.fe.up.pt")
      .setValue("input.login-password","teste123")
      .click('button.login-submit')
      .click('//td[text() = "project miel picante"]/following-sibling::td/a[text() = "Join"]')
      .waitFor('.command-component.component', function(err){checkpoint.finish(err)})
  });
  
  
  it('should collaboratively move a component', function(done) {
    var checkpoint = startCheckpoint(2,done)
    browserA
      .pause(4000)
      .waitFor('.command-component')
      .dragBy('.command-component',0,50)
      .pause(1000,function(){
        browserB
        .waitFor('.command-component')
        .dragBy('.command-component',0,-50)
        .pause(1000, function(){checkpoint.finish()})
      
      })
      
      //.element('.file-component',function(err,result) {
      //  drag(browserA,result.value.ELEMENT,20,20,0,50,15, function(){
      //    //browserA.wait()
      //    drag(browserA,result.value.ELEMENT,20,20,0,-50,15, function(){checkpoint.finish()})
      //  })  
      //})
      
      setTimeout(function(){checkpoint.finish()},1000);
  });
  
   after(function(){
     browserA.end();
     browserB.end();
   })
  
  
  
  
/*  browser.getAllWindowHandles().then(function (handles) {

  // handle of first window
  var originalHandle = handles[0];

  // open new window
  browser.executeScript('window.open("https://angularjs.org/", "second-window")');

  // switch to new window
  browser.switchTo().window('second-window');

  // do something within context of new window

  // switch to original window
  browser.switchTo().window(originalHandle);

  // do something within context of original window

  // closes the current window
  browser.executeScript('window.close()');

});*/
});