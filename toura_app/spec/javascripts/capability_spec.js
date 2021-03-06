describe("capabilities", function() {
  var t, c, C, page, flag, components;

  beforeEach(function() {
    dojo.require('toura.capabilities._Capability');
    dojo.require('toura.components._Component');

    C = toura.capabilities._Capability;

    page = {
      domNode : dojo.byId('test'),
      node : {},
      connect : function() {},
      getScreen : function() {
        return {
          getComponent : function() {
            return new toura.components.FakeComponent();
          }
        };
      }
    };

    dojo.declare('my.FakeCapability', [ toura.capabilities._Capability ], {
      init : function() { flag = true; }
    });

    dojo.declare('toura.components.FakeComponent', [ toura.components._Component ], {
      templateString : '<div></div>',
      fakeMethod : function() {
        console.log('called fake method');
      }
    });

    flag = false;
  });

  it("should run the init method of the capability on instantiation", function() {
    var c = new my.FakeCapability({ page : page });
    expect(flag).toBeTruthy();
  });

  it("should expose a method that allows registering event connections with the related page", function() {
    var spy = spyOn(page, 'connect').andCallThrough();
    var c = new my.FakeCapability({ page : page });

    c.foo = function() {};
    c.bar = function() { flag = true; };

    c.connect(c, 'foo', 'bar');
    c.foo();

    expect(spy).toHaveBeenCalled();
    expect(flag).toBeTruthy();
  });

  it("should create properties from the components object", function() {
    var component = new toura.components.FakeComponent().placeAt(dojo.byId('test')),
        c = new my.FakeCapability({
          page : page,
          requirements : { foo : 'FakeComponent' },
          components : [ 'screenName:FakeComponent' ]
        });

    expect(c.foo).toBeDefined();
  });

  it("should create connections based on the connects array", function() {
    var spy = spyOn(page, 'connect');

    var component = new toura.components.FakeComponent().placeAt(dojo.byId('test')),
        c = new my.FakeCapability({
          page : page,
          requirements : { component : 'FakeComponent' },
          components : [ 'screenName:FakeComponent' ],
          connects : [
            // when the component's 'fakeMethod' method is called,
            // run the capability's 'bar' method
            [ 'component', 'fakeMethod', 'bar' ]
          ],
          bar : function() {
            flag = true;
          }
        });

    expect(spy.mostRecentCall.args[1]).toBe('fakeMethod');

    // will it call the connected method?
    spy.mostRecentCall.args[2]();
    expect(flag).toBeTruthy();
  });

});

