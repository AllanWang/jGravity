/*

 * @project:	jGravity
 * @version:	0.9 - 29/10/2016
 * @author:		Craig Thomas - www.tinybigideas.com
 * @updater:    Allan Wang - www.allanwang.ca
 * @project:	http://tinybigideas.com/plugins/jquery-gravity/
 * @license:	jGravity is licensed under a Open Source Initiative OSI MIT License: http://opensource.org/licenses/mit-license.php
 * @changelog:	http://tinybigideas.com/plugins/jquery-gravity/

 */

/*------------------------------------*\
 CREDITS
 \*------------------------------------*/
/*
 - Mr. Doobs :: http://mrdoob.com/92/Google_Gravity
 - GravityScript :: http://gravityscript.googlecode.com/
 - Alex Arnell's inheritance.js :: http://code.google.com/p/inheritance/
 - Box2Djs :: http://box2d-js.sourceforge.net/
 */

/*------------------------------------*\
 CONTENTS
 \*------------------------------------*/
/*

 LIBRARIES
 - Alex Arnell's inheritance.js
 - Box2Djs (port of Box2DFlash 1.4.3.1) :: http://box2d-js.sourceforge.net/

 WORKERS
 - variables
 - get browser dimensions
 - initialise

 FUNCTIONS
 - init()
 - run()
 - onDocumentMouseDown()
 - onDocumentMouseUp()
 - onDocumentMouseMove()
 - onElementMouseDown()
 - onnElementMouseUp()
 - loop()
 - createBox()
 - mouseDrag()
 - getBodyAtMouse()
 - setWalls()
 - getBrowserDimensions()

 */

(function ($) {
    $.fn.extend({
        jGravity: function (options) {

            // set default settings
            var settings = {
                target: 'div, span, img, ol, ul, li, a, blockquote, button, input, embed, h1, h2, h3, h4, h5, h6, label, object, option, p, pre, span, table',
                ignoreClass: '',
                weight: 20,
                depth: 1,
                drag: true,
                callback: null
            }

            var options = $.extend(settings, options);

            return this.each(function () {
                var o = options;

                // allow user to specify target as 'everything'
                if (o.target == 'everything') {
                    o.target = 'body *'
                }

                // allow user to specify weight as 'light' or 'heavy'
                if (o.weight == 'light') {
                    o.weight = 50;
                }
                else if (o.weight == 'heavy') {
                    o.weight = 1;
                }

                // Add gravity to target elements
                $(o.target).each(function () {
                    if ($(this).children().length < o.depth && !$(this).hasClass(o.ignoreClass)) { // filter by depth + ignoreClass
                        $(this).addClass("box2d");
                        $(this).css("zIndex", "999");
                    }
                });

                /*------------------------------------*\
                 LIBRARIES
                 \*------------------------------------*/

// Alex Arnell's inheritance.js :: http://code.google.com/p/inheritance/
                function $A(a) {
                    if (!a)return [];
                    if (a.toArray)return a.toArray();
                    var b = a.length || 0, c = new Array(b);
                    while (b--)c[b] = a[b];
                    return c
                }

                var Class = {
                    create: function () {
                        function c() {
                            this.initialize.apply(this, arguments)
                        }

                        var a = null, b = $A(arguments);
                        if (Object.isFunction(b[0]))a = b.shift();
                        Object.extend(c, Class.Methods);
                        c.superclass = a;
                        c.subclasses = [];
                        if (a) {
                            var d = function () {
                            };
                            d.prototype = a.prototype;
                            c.prototype = new d;
                            a.subclasses.push(c)
                        }
                        for (var e = 0; e < b.length; e++)c.addMethods(b[e]);
                        if (!c.prototype.initialize)c.prototype.initialize = this.emptyFunction;
                        c.prototype.constructor = c;
                        return c
                    }, emptyFunction: function () {
                    }
                };
                Class.Methods = {
                    addMethods: function (a) {
                        var b = this.superclass && this.superclass.prototype;
                        var c = Object.keys(a);
                        if (!Object.keys({toString: true}).length)c.push("toString", "valueOf");
                        for (var d = 0, e = c.length; d < e; d++) {
                            var f = c[d], g = a[f];
                            if (b && Object.isFunction(g) && g.argumentNames().first() == "$super") {
                                var h = g, g = Object.extend(function (a) {
                                    return function () {
                                        return b[a].apply(this, arguments)
                                    }
                                }(f).wrap(h), {
                                    valueOf: function () {
                                        return h
                                    }, toString: function () {
                                        return h.toString()
                                    }
                                })
                            }
                            this.prototype[f] = g
                        }
                        return this
                    }
                };
                Object.extend = function (a, b) {
                    for (var c in b)a[c] = b[c];
                    return a
                };
                Object.extend(Object, {
                    inspect: function (a) {
                        try {
                            if (Object.isUndefined(a))return "undefined";
                            if (a === null)return "null";
                            return a.inspect ? a.inspect() : String(a)
                        } catch (b) {
                            if (b instanceof RangeError)return "...";
                            throw b
                        }
                    }, toJSON: function (a) {
                        var b = typeof a;
                        switch (b) {
                            case"undefined":
                            case"function":
                            case"unknown":
                                return;
                            case"boolean":
                                return a.toString()
                        }
                        if (a === null)return "null";
                        if (a.toJSON)return a.toJSON();
                        if (Object.isElement(a))return;
                        var c = [];
                        for (var d in a) {
                            var e = Object.toJSON(a[d]);
                            if (!Object.isUndefined(e))c.push(d.toJSON() + ": " + e)
                        }
                        return "{" + c.join(", ") + "}"
                    }, toQueryString: function (a) {
                        return $H(a).toQueryString()
                    }, toHTML: function (a) {
                        return a && a.toHTML ? a.toHTML() : String.interpret(a)
                    }, keys: function (a) {
                        var b = [];
                        for (var c in a)b.push(c);
                        return b
                    }, values: function (a) {
                        var b = [];
                        for (var c in a)b.push(a[c]);
                        return b
                    }, clone: function (a) {
                        return Object.extend({}, a)
                    }, isElement: function (a) {
                        return a && a.nodeType == 1
                    }, isArray: function (a) {
                        return a != null && typeof a == "object" && "splice" in a && "join" in a
                    }, isHash: function (a) {
                        return a instanceof Hash
                    }, isFunction: function (a) {
                        return typeof a == "function"
                    }, isString: function (a) {
                        return typeof a == "string"
                    }, isNumber: function (a) {
                        return typeof a == "number"
                    }, isUndefined: function (a) {
                        return typeof a == "undefined"
                    }
                });
                if (WebKit = navigator.userAgent.indexOf("AppleWebKit/") > -1) {
                    $A = function (a) {
                        if (!a)return [];
                        if (!(Object.isFunction(a) && a == "[object NodeList]") && a.toArray)return a.toArray();
                        var b = a.length || 0, c = new Array(b);
                        while (b--)c[b] = a[b];
                        return c
                    }
                }

// Box2Djs (port of Box2DFlash 1.4.3.1) :: http://box2d-js.sourceforge.net/
                var b2Settings = Class.create();
                b2Settings.prototype = {
                    initialize: function () {
                    }
                };
                b2Settings.USHRT_MAX = 65535;
                b2Settings.b2_pi = Math.PI;
                b2Settings.b2_massUnitsPerKilogram = 1;
                b2Settings.b2_timeUnitsPerSecond = 1;
                b2Settings.b2_lengthUnitsPerMeter = 30;
                b2Settings.b2_maxManifoldPoints = 2;
                b2Settings.b2_maxShapesPerBody = 64;
                b2Settings.b2_maxPolyVertices = 8;
                b2Settings.b2_maxProxies = 1024;
                b2Settings.b2_maxPairs = 8 * b2Settings.b2_maxProxies;
                b2Settings.b2_linearSlop = .005 * b2Settings.b2_lengthUnitsPerMeter;
                b2Settings.b2_angularSlop = 2 / 180 * b2Settings.b2_pi;
                b2Settings.b2_velocityThreshold = 1 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
                b2Settings.b2_maxLinearCorrection = .2 * b2Settings.b2_lengthUnitsPerMeter;
                b2Settings.b2_maxAngularCorrection = 8 / 180 * b2Settings.b2_pi;
                b2Settings.b2_contactBaumgarte = .2;
                b2Settings.b2_timeToSleep = .5 * b2Settings.b2_timeUnitsPerSecond;
                b2Settings.b2_linearSleepTolerance = .01 * b2Settings.b2_lengthUnitsPerMeter / b2Settings.b2_timeUnitsPerSecond;
                b2Settings.b2_angularSleepTolerance = 2 / 180 / b2Settings.b2_timeUnitsPerSecond;
                b2Settings.b2Assert = function (a) {
                    if (!a) {
                        var b;
                        b.x++
                    }
                };
                var b2Vec2 = Class.create();
                b2Vec2.prototype = {
                    initialize: function (a, b) {
                        this.x = a;
                        this.y = b
                    }, SetZero: function () {
                        this.x = 0;
                        this.y = 0
                    }, Set: function (a, b) {
                        this.x = a;
                        this.y = b
                    }, SetV: function (a) {
                        this.x = a.x;
                        this.y = a.y
                    }, Negative: function () {
                        return new b2Vec2(-this.x, -this.y)
                    }, Copy: function () {
                        return new b2Vec2(this.x, this.y)
                    }, Add: function (a) {
                        this.x += a.x;
                        this.y += a.y
                    }, Subtract: function (a) {
                        this.x -= a.x;
                        this.y -= a.y
                    }, Multiply: function (a) {
                        this.x *= a;
                        this.y *= a
                    }, MulM: function (a) {
                        var b = this.x;
                        this.x = a.col1.x * b + a.col2.x * this.y;
                        this.y = a.col1.y * b + a.col2.y * this.y
                    }, MulTM: function (a) {
                        var b = b2Math.b2Dot(this, a.col1);
                        this.y = b2Math.b2Dot(this, a.col2);
                        this.x = b
                    }, CrossVF: function (a) {
                        var b = this.x;
                        this.x = a * this.y;
                        this.y = -a * b
                    }, CrossFV: function (a) {
                        var b = this.x;
                        this.x = -a * this.y;
                        this.y = a * b
                    }, MinV: function (a) {
                        this.x = this.x < a.x ? this.x : a.x;
                        this.y = this.y < a.y ? this.y : a.y
                    }, MaxV: function (a) {
                        this.x = this.x > a.x ? this.x : a.x;
                        this.y = this.y > a.y ? this.y : a.y
                    }, Abs: function () {
                        this.x = Math.abs(this.x);
                        this.y = Math.abs(this.y)
                    }, Length: function () {
                        return Math.sqrt(this.x * this.x + this.y * this.y)
                    }, Normalize: function () {
                        var a = this.Length();
                        if (a < Number.MIN_VALUE) {
                            return 0
                        }
                        var b = 1 / a;
                        this.x *= b;
                        this.y *= b;
                        return a
                    }, IsValid: function () {
                        return b2Math.b2IsValid(this.x) && b2Math.b2IsValid(this.y)
                    }, x: null, y: null
                };
                b2Vec2.Make = function (a, b) {
                    return new b2Vec2(a, b)
                };
                var b2Mat22 = Class.create();
                b2Mat22.prototype = {
                    initialize: function (a, b, c) {
                        if (a == null)a = 0;
                        this.col1 = new b2Vec2;
                        this.col2 = new b2Vec2;
                        if (b != null && c != null) {
                            this.col1.SetV(b);
                            this.col2.SetV(c)
                        } else {
                            var d = Math.cos(a);
                            var e = Math.sin(a);
                            this.col1.x = d;
                            this.col2.x = -e;
                            this.col1.y = e;
                            this.col2.y = d
                        }
                    }, Set: function (a) {
                        var b = Math.cos(a);
                        var c = Math.sin(a);
                        this.col1.x = b;
                        this.col2.x = -c;
                        this.col1.y = c;
                        this.col2.y = b
                    }, SetVV: function (a, b) {
                        this.col1.SetV(a);
                        this.col2.SetV(b)
                    }, Copy: function () {
                        return new b2Mat22(0, this.col1, this.col2)
                    }, SetM: function (a) {
                        this.col1.SetV(a.col1);
                        this.col2.SetV(a.col2)
                    }, AddM: function (a) {
                        this.col1.x += a.col1.x;
                        this.col1.y += a.col1.y;
                        this.col2.x += a.col2.x;
                        this.col2.y += a.col2.y
                    }, SetIdentity: function () {
                        this.col1.x = 1;
                        this.col2.x = 0;
                        this.col1.y = 0;
                        this.col2.y = 1
                    }, SetZero: function () {
                        this.col1.x = 0;
                        this.col2.x = 0;
                        this.col1.y = 0;
                        this.col2.y = 0
                    }, Invert: function (a) {
                        var b = this.col1.x;
                        var c = this.col2.x;
                        var d = this.col1.y;
                        var e = this.col2.y;
                        var f = b * e - c * d;
                        f = 1 / f;
                        a.col1.x = f * e;
                        a.col2.x = -f * c;
                        a.col1.y = -f * d;
                        a.col2.y = f * b;
                        return a
                    }, Solve: function (a, b, c) {
                        var d = this.col1.x;
                        var e = this.col2.x;
                        var f = this.col1.y;
                        var g = this.col2.y;
                        var h = d * g - e * f;
                        h = 1 / h;
                        a.x = h * (g * b - e * c);
                        a.y = h * (d * c - f * b);
                        return a
                    }, Abs: function () {
                        this.col1.Abs();
                        this.col2.Abs()
                    }, col1: new b2Vec2, col2: new b2Vec2
                };
                var b2Math = Class.create();
                b2Math.prototype = {
                    initialize: function () {
                    }
                };
                b2Math.b2IsValid = function (a) {
                    return isFinite(a)
                };
                b2Math.b2Dot = function (a, b) {
                    return a.x * b.x + a.y * b.y
                };
                b2Math.b2CrossVV = function (a, b) {
                    return a.x * b.y - a.y * b.x
                };
                b2Math.b2CrossVF = function (a, b) {
                    var c = new b2Vec2(b * a.y, -b * a.x);
                    return c
                };
                b2Math.b2CrossFV = function (a, b) {
                    var c = new b2Vec2(-a * b.y, a * b.x);
                    return c
                };
                b2Math.b2MulMV = function (a, b) {
                    var c = new b2Vec2(a.col1.x * b.x + a.col2.x * b.y, a.col1.y * b.x + a.col2.y * b.y);
                    return c
                };
                b2Math.b2MulTMV = function (a, b) {
                    var c = new b2Vec2(b2Math.b2Dot(b, a.col1), b2Math.b2Dot(b, a.col2));
                    return c
                };
                b2Math.AddVV = function (a, b) {
                    var c = new b2Vec2(a.x + b.x, a.y + b.y);
                    return c
                };
                b2Math.SubtractVV = function (a, b) {
                    var c = new b2Vec2(a.x - b.x, a.y - b.y);
                    return c
                };
                b2Math.MulFV = function (a, b) {
                    var c = new b2Vec2(a * b.x, a * b.y);
                    return c
                };
                b2Math.AddMM = function (a, b) {
                    var c = new b2Mat22(0, b2Math.AddVV(a.col1, b.col1), b2Math.AddVV(a.col2, b.col2));
                    return c
                };
                b2Math.b2MulMM = function (a, b) {
                    var c = new b2Mat22(0, b2Math.b2MulMV(a, b.col1), b2Math.b2MulMV(a, b.col2));
                    return c
                };
                b2Math.b2MulTMM = function (a, b) {
                    var c = new b2Vec2(b2Math.b2Dot(a.col1, b.col1), b2Math.b2Dot(a.col2, b.col1));
                    var d = new b2Vec2(b2Math.b2Dot(a.col1, b.col2), b2Math.b2Dot(a.col2, b.col2));
                    var e = new b2Mat22(0, c, d);
                    return e
                };
                b2Math.b2Abs = function (a) {
                    return a > 0 ? a : -a
                };
                b2Math.b2AbsV = function (a) {
                    var b = new b2Vec2(b2Math.b2Abs(a.x), b2Math.b2Abs(a.y));
                    return b
                };
                b2Math.b2AbsM = function (a) {
                    var b = new b2Mat22(0, b2Math.b2AbsV(a.col1), b2Math.b2AbsV(a.col2));
                    return b
                };
                b2Math.b2Min = function (a, b) {
                    return a < b ? a : b
                };
                b2Math.b2MinV = function (a, b) {
                    var c = new b2Vec2(b2Math.b2Min(a.x, b.x), b2Math.b2Min(a.y, b.y));
                    return c
                };
                b2Math.b2Max = function (a, b) {
                    return a > b ? a : b
                };
                b2Math.b2MaxV = function (a, b) {
                    var c = new b2Vec2(b2Math.b2Max(a.x, b.x), b2Math.b2Max(a.y, b.y));
                    return c
                };
                b2Math.b2Clamp = function (a, b, c) {
                    return b2Math.b2Max(b, b2Math.b2Min(a, c))
                };
                b2Math.b2ClampV = function (a, b, c) {
                    return b2Math.b2MaxV(b, b2Math.b2MinV(a, c))
                };
                b2Math.b2Swap = function (a, b) {
                    var c = a[0];
                    a[0] = b[0];
                    b[0] = c
                };
                b2Math.b2Random = function () {
                    return Math.random() * 2 - 1
                };
                b2Math.b2NextPowerOfTwo = function (a) {
                    a |= a >> 1 & 2147483647;
                    a |= a >> 2 & 1073741823;
                    a |= a >> 4 & 268435455;
                    a |= a >> 8 & 16777215;
                    a |= a >> 16 & 65535;
                    return a + 1
                };
                b2Math.b2IsPowerOfTwo = function (a) {
                    var b = a > 0 && (a & a - 1) == 0;
                    return b
                };
                b2Math.tempVec2 = new b2Vec2;
                b2Math.tempVec3 = new b2Vec2;
                b2Math.tempVec4 = new b2Vec2;
                b2Math.tempVec5 = new b2Vec2;
                b2Math.tempMat = new b2Mat22;
                var b2AABB = Class.create();
                b2AABB.prototype = {
                    IsValid: function () {
                        var a = this.maxVertex.x;
                        var b = this.maxVertex.y;
                        a = this.maxVertex.x;
                        b = this.maxVertex.y;
                        a -= this.minVertex.x;
                        b -= this.minVertex.y;
                        var c = a >= 0 && b >= 0;
                        c = c && this.minVertex.IsValid() && this.maxVertex.IsValid();
                        return c
                    }, minVertex: new b2Vec2, maxVertex: new b2Vec2, initialize: function () {
                        this.minVertex = new b2Vec2;
                        this.maxVertex = new b2Vec2
                    }
                };
                var b2Bound = Class.create();
                b2Bound.prototype = {
                    IsLower: function () {
                        return (this.value & 1) == 0
                    }, IsUpper: function () {
                        return (this.value & 1) == 1
                    }, Swap: function (a) {
                        var b = this.value;
                        var c = this.proxyId;
                        var d = this.stabbingCount;
                        this.value = a.value;
                        this.proxyId = a.proxyId;
                        this.stabbingCount = a.stabbingCount;
                        a.value = b;
                        a.proxyId = c;
                        a.stabbingCount = d
                    }, value: 0, proxyId: 0, stabbingCount: 0, initialize: function () {
                    }
                };
                var b2BoundValues = Class.create();
                b2BoundValues.prototype = {
                    lowerValues: [0, 0], upperValues: [0, 0], initialize: function () {
                        this.lowerValues = [0, 0];
                        this.upperValues = [0, 0]
                    }
                };
                var b2Pair = Class.create();
                b2Pair.prototype = {
                    SetBuffered: function () {
                        this.status |= b2Pair.e_pairBuffered
                    }, ClearBuffered: function () {
                        this.status &= ~b2Pair.e_pairBuffered
                    }, IsBuffered: function () {
                        return (this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered
                    }, SetRemoved: function () {
                        this.status |= b2Pair.e_pairRemoved
                    }, ClearRemoved: function () {
                        this.status &= ~b2Pair.e_pairRemoved
                    }, IsRemoved: function () {
                        return (this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved
                    }, SetFinal: function () {
                        this.status |= b2Pair.e_pairFinal
                    }, IsFinal: function () {
                        return (this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal
                    }, userData: null, proxyId1: 0, proxyId2: 0, next: 0, status: 0, initialize: function () {
                    }
                };
                b2Pair.b2_nullPair = b2Settings.USHRT_MAX;
                b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
                b2Pair.b2_tableCapacity = b2Settings.b2_maxPairs;
                b2Pair.b2_tableMask = b2Pair.b2_tableCapacity - 1;
                b2Pair.e_pairBuffered = 1;
                b2Pair.e_pairRemoved = 2;
                b2Pair.e_pairFinal = 4;
                var b2PairCallback = Class.create();
                b2PairCallback.prototype = {
                    PairAdded: function (a, b) {
                        return null
                    }, PairRemoved: function (a, b, c) {
                    }, initialize: function () {
                    }
                };
                var b2BufferedPair = Class.create();
                b2BufferedPair.prototype = {
                    proxyId1: 0, proxyId2: 0, initialize: function () {
                    }
                };
                var b2PairManager = Class.create();
                b2PairManager.prototype = {
                    initialize: function () {
                        var a = 0;
                        this.m_hashTable = new Array(b2Pair.b2_tableCapacity);
                        for (a = 0; a < b2Pair.b2_tableCapacity; ++a) {
                            this.m_hashTable[a] = b2Pair.b2_nullPair
                        }
                        this.m_pairs = new Array(b2Settings.b2_maxPairs);
                        for (a = 0; a < b2Settings.b2_maxPairs; ++a) {
                            this.m_pairs[a] = new b2Pair
                        }
                        this.m_pairBuffer = new Array(b2Settings.b2_maxPairs);
                        for (a = 0; a < b2Settings.b2_maxPairs; ++a) {
                            this.m_pairBuffer[a] = new b2BufferedPair
                        }
                        for (a = 0; a < b2Settings.b2_maxPairs; ++a) {
                            this.m_pairs[a].proxyId1 = b2Pair.b2_nullProxy;
                            this.m_pairs[a].proxyId2 = b2Pair.b2_nullProxy;
                            this.m_pairs[a].userData = null;
                            this.m_pairs[a].status = 0;
                            this.m_pairs[a].next = a + 1
                        }
                        this.m_pairs[b2Settings.b2_maxPairs - 1].next = b2Pair.b2_nullPair;
                        this.m_pairCount = 0
                    },
                    Initialize: function (a, b) {
                        this.m_broadPhase = a;
                        this.m_callback = b
                    },
                    AddBufferedPair: function (a, b) {
                        var c = this.AddPair(a, b);
                        if (c.IsBuffered() == false) {
                            c.SetBuffered();
                            this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = c.proxyId1;
                            this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = c.proxyId2;
                            ++this.m_pairBufferCount
                        }
                        c.ClearRemoved();
                        if (b2BroadPhase.s_validate) {
                            this.ValidateBuffer()
                        }
                    },
                    RemoveBufferedPair: function (a, b) {
                        var c = this.Find(a, b);
                        if (c == null) {
                            return
                        }
                        if (c.IsBuffered() == false) {
                            c.SetBuffered();
                            this.m_pairBuffer[this.m_pairBufferCount].proxyId1 = c.proxyId1;
                            this.m_pairBuffer[this.m_pairBufferCount].proxyId2 = c.proxyId2;
                            ++this.m_pairBufferCount
                        }
                        c.SetRemoved();
                        if (b2BroadPhase.s_validate) {
                            this.ValidateBuffer()
                        }
                    },
                    Commit: function () {
                        var a = 0;
                        var b = 0;
                        var c = this.m_broadPhase.m_proxyPool;
                        for (a = 0; a < this.m_pairBufferCount; ++a) {
                            var d = this.Find(this.m_pairBuffer[a].proxyId1, this.m_pairBuffer[a].proxyId2);
                            d.ClearBuffered();
                            var e = c[d.proxyId1];
                            var f = c[d.proxyId2];
                            if (d.IsRemoved()) {
                                if (d.IsFinal() == true) {
                                    this.m_callback.PairRemoved(e.userData, f.userData, d.userData)
                                }
                                this.m_pairBuffer[b].proxyId1 = d.proxyId1;
                                this.m_pairBuffer[b].proxyId2 = d.proxyId2;
                                ++b
                            } else {
                                if (d.IsFinal() == false) {
                                    d.userData = this.m_callback.PairAdded(e.userData, f.userData);
                                    d.SetFinal()
                                }
                            }
                        }
                        for (a = 0; a < b; ++a) {
                            this.RemovePair(this.m_pairBuffer[a].proxyId1, this.m_pairBuffer[a].proxyId2)
                        }
                        this.m_pairBufferCount = 0;
                        if (b2BroadPhase.s_validate) {
                            this.ValidateTable()
                        }
                    },
                    AddPair: function (a, b) {
                        if (a > b) {
                            var c = a;
                            a = b;
                            b = c
                        }
                        var d = b2PairManager.Hash(a, b) & b2Pair.b2_tableMask;
                        var e = e = this.FindHash(a, b, d);
                        if (e != null) {
                            return e
                        }
                        var f = this.m_freePair;
                        e = this.m_pairs[f];
                        this.m_freePair = e.next;
                        e.proxyId1 = a;
                        e.proxyId2 = b;
                        e.status = 0;
                        e.userData = null;
                        e.next = this.m_hashTable[d];
                        this.m_hashTable[d] = f;
                        ++this.m_pairCount;
                        return e
                    },
                    RemovePair: function (a, b) {
                        if (a > b) {
                            var c = a;
                            a = b;
                            b = c
                        }
                        var d = b2PairManager.Hash(a, b) & b2Pair.b2_tableMask;
                        var e = this.m_hashTable[d];
                        var f = null;
                        while (e != b2Pair.b2_nullPair) {
                            if (b2PairManager.Equals(this.m_pairs[e], a, b)) {
                                var g = e;
                                if (f) {
                                    f.next = this.m_pairs[e].next
                                } else {
                                    this.m_hashTable[d] = this.m_pairs[e].next
                                }
                                var h = this.m_pairs[g];
                                var i = h.userData;
                                h.next = this.m_freePair;
                                h.proxyId1 = b2Pair.b2_nullProxy;
                                h.proxyId2 = b2Pair.b2_nullProxy;
                                h.userData = null;
                                h.status = 0;
                                this.m_freePair = g;
                                --this.m_pairCount;
                                return i
                            } else {
                                f = this.m_pairs[e];
                                e = f.next
                            }
                        }
                        return null
                    },
                    Find: function (a, b) {
                        if (a > b) {
                            var c = a;
                            a = b;
                            b = c
                        }
                        var d = b2PairManager.Hash(a, b) & b2Pair.b2_tableMask;
                        return this.FindHash(a, b, d)
                    },
                    FindHash: function (a, b, c) {
                        var d = this.m_hashTable[c];
                        while (d != b2Pair.b2_nullPair && b2PairManager.Equals(this.m_pairs[d], a, b) == false) {
                            d = this.m_pairs[d].next
                        }
                        if (d == b2Pair.b2_nullPair) {
                            return null
                        }
                        return this.m_pairs[d]
                    },
                    ValidateBuffer: function () {
                    },
                    ValidateTable: function () {
                    },
                    m_broadPhase: null,
                    m_callback: null,
                    m_pairs: null,
                    m_freePair: 0,
                    m_pairCount: 0,
                    m_pairBuffer: null,
                    m_pairBufferCount: 0,
                    m_hashTable: null
                };
                b2PairManager.Hash = function (a, b) {
                    var c = b << 16 & 4294901760 | a;
                    c = ~c + (c << 15 & 4294934528);
                    c = c ^ c >> 12 & 1048575;
                    c = c + (c << 2 & 4294967292);
                    c = c ^ c >> 4 & 268435455;
                    c = c * 2057;
                    c = c ^ c >> 16 & 65535;
                    return c
                };
                b2PairManager.Equals = function (a, b, c) {
                    return a.proxyId1 == b && a.proxyId2 == c
                };
                b2PairManager.EqualsPair = function (a, b) {
                    return a.proxyId1 == b.proxyId1 && a.proxyId2 == b.proxyId2
                };
                var b2BroadPhase = Class.create();
                b2BroadPhase.prototype = {
                    initialize: function (a, b) {
                        this.m_pairManager = new b2PairManager;
                        this.m_proxyPool = new Array(b2Settings.b2_maxPairs);
                        this.m_bounds = new Array(2 * b2Settings.b2_maxProxies);
                        this.m_queryResults = new Array(b2Settings.b2_maxProxies);
                        this.m_quantizationFactor = new b2Vec2;
                        var c = 0;
                        this.m_pairManager.Initialize(this, b);
                        this.m_worldAABB = a;
                        this.m_proxyCount = 0;
                        for (c = 0; c < b2Settings.b2_maxProxies; c++) {
                            this.m_queryResults[c] = 0
                        }
                        this.m_bounds = new Array(2);
                        for (c = 0; c < 2; c++) {
                            this.m_bounds[c] = new Array(2 * b2Settings.b2_maxProxies);
                            for (var d = 0; d < 2 * b2Settings.b2_maxProxies; d++) {
                                this.m_bounds[c][d] = new b2Bound
                            }
                        }
                        var e = a.maxVertex.x;
                        var f = a.maxVertex.y;
                        e -= a.minVertex.x;
                        f -= a.minVertex.y;
                        this.m_quantizationFactor.x = b2Settings.USHRT_MAX / e;
                        this.m_quantizationFactor.y = b2Settings.USHRT_MAX / f;
                        var g;
                        for (c = 0; c < b2Settings.b2_maxProxies - 1; ++c) {
                            g = new b2Proxy;
                            this.m_proxyPool[c] = g;
                            g.SetNext(c + 1);
                            g.timeStamp = 0;
                            g.overlapCount = b2BroadPhase.b2_invalid;
                            g.userData = null
                        }
                        g = new b2Proxy;
                        this.m_proxyPool[b2Settings.b2_maxProxies - 1] = g;
                        g.SetNext(b2Pair.b2_nullProxy);
                        g.timeStamp = 0;
                        g.overlapCount = b2BroadPhase.b2_invalid;
                        g.userData = null;
                        this.m_freeProxy = 0;
                        this.m_timeStamp = 1;
                        this.m_queryResultCount = 0
                    },
                    InRange: function (a) {
                        var b;
                        var c;
                        var d;
                        var e;
                        b = a.minVertex.x;
                        c = a.minVertex.y;
                        b -= this.m_worldAABB.maxVertex.x;
                        c -= this.m_worldAABB.maxVertex.y;
                        d = this.m_worldAABB.minVertex.x;
                        e = this.m_worldAABB.minVertex.y;
                        d -= a.maxVertex.x;
                        e -= a.maxVertex.y;
                        b = b2Math.b2Max(b, d);
                        c = b2Math.b2Max(c, e);
                        return b2Math.b2Max(b, c) < 0
                    },
                    GetProxy: function (a) {
                        if (a == b2Pair.b2_nullProxy || this.m_proxyPool[a].IsValid() == false) {
                            return null
                        }
                        return this.m_proxyPool[a]
                    },
                    CreateProxy: function (a, b) {
                        var c = 0;
                        var d;
                        var e = this.m_freeProxy;
                        d = this.m_proxyPool[e];
                        this.m_freeProxy = d.GetNext();
                        d.overlapCount = 0;
                        d.userData = b;
                        var f = 2 * this.m_proxyCount;
                        var g = new Array;
                        var h = new Array;
                        this.ComputeBounds(g, h, a);
                        for (var i = 0; i < 2; ++i) {
                            var j = this.m_bounds[i];
                            var k = 0;
                            var l = 0;
                            var m = [k];
                            var n = [l];
                            this.Query(m, n, g[i], h[i], j, f, i);
                            k = m[0];
                            l = n[0];
                            var o = new Array;
                            var p = 0;
                            var q = f - l;
                            var r;
                            var s;
                            for (p = 0; p < q; p++) {
                                o[p] = new b2Bound;
                                r = o[p];
                                s = j[l + p];
                                r.value = s.value;
                                r.proxyId = s.proxyId;
                                r.stabbingCount = s.stabbingCount
                            }
                            q = o.length;
                            var t = l + 2;
                            for (p = 0; p < q; p++) {
                                s = o[p];
                                r = j[t + p];
                                r.value = s.value;
                                r.proxyId = s.proxyId;
                                r.stabbingCount = s.stabbingCount
                            }
                            o = new Array;
                            q = l - k;
                            for (p = 0; p < q; p++) {
                                o[p] = new b2Bound;
                                r = o[p];
                                s = j[k + p];
                                r.value = s.value;
                                r.proxyId = s.proxyId;
                                r.stabbingCount = s.stabbingCount
                            }
                            q = o.length;
                            t = k + 1;
                            for (p = 0; p < q; p++) {
                                s = o[p];
                                r = j[t + p];
                                r.value = s.value;
                                r.proxyId = s.proxyId;
                                r.stabbingCount = s.stabbingCount
                            }
                            ++l;
                            j[k].value = g[i];
                            j[k].proxyId = e;
                            j[l].value = h[i];
                            j[l].proxyId = e;
                            j[k].stabbingCount = k == 0 ? 0 : j[k - 1].stabbingCount;
                            j[l].stabbingCount = j[l - 1].stabbingCount;
                            for (c = k; c < l; ++c) {
                                j[c].stabbingCount++
                            }
                            for (c = k; c < f + 2; ++c) {
                                var u = this.m_proxyPool[j[c].proxyId];
                                if (j[c].IsLower()) {
                                    u.lowerBounds[i] = c
                                } else {
                                    u.upperBounds[i] = c
                                }
                            }
                        }
                        ++this.m_proxyCount;
                        for (var v = 0; v < this.m_queryResultCount; ++v) {
                            this.m_pairManager.AddBufferedPair(e, this.m_queryResults[v])
                        }
                        this.m_pairManager.Commit();
                        this.m_queryResultCount = 0;
                        this.IncrementTimeStamp();
                        return e
                    },
                    DestroyProxy: function (a) {
                        var b = this.m_proxyPool[a];
                        var c = 2 * this.m_proxyCount;
                        for (var d = 0; d < 2; ++d) {
                            var e = this.m_bounds[d];
                            var f = b.lowerBounds[d];
                            var g = b.upperBounds[d];
                            var h = e[f].value;
                            var i = e[g].value;
                            var j = new Array;
                            var k = 0;
                            var l = g - f - 1;
                            var m;
                            var n;
                            for (k = 0; k < l; k++) {
                                j[k] = new b2Bound;
                                m = j[k];
                                n = e[f + 1 + k];
                                m.value = n.value;
                                m.proxyId = n.proxyId;
                                m.stabbingCount = n.stabbingCount
                            }
                            l = j.length;
                            var o = f;
                            for (k = 0; k < l; k++) {
                                n = j[k];
                                m = e[o + k];
                                m.value = n.value;
                                m.proxyId = n.proxyId;
                                m.stabbingCount = n.stabbingCount
                            }
                            j = new Array;
                            l = c - g - 1;
                            for (k = 0; k < l; k++) {
                                j[k] = new b2Bound;
                                m = j[k];
                                n = e[g + 1 + k];
                                m.value = n.value;
                                m.proxyId = n.proxyId;
                                m.stabbingCount = n.stabbingCount
                            }
                            l = j.length;
                            o = g - 1;
                            for (k = 0; k < l; k++) {
                                n = j[k];
                                m = e[o + k];
                                m.value = n.value;
                                m.proxyId = n.proxyId;
                                m.stabbingCount = n.stabbingCount
                            }
                            l = c - 2;
                            for (var p = f; p < l; ++p) {
                                var q = this.m_proxyPool[e[p].proxyId];
                                if (e[p].IsLower()) {
                                    q.lowerBounds[d] = p
                                } else {
                                    q.upperBounds[d] = p
                                }
                            }
                            l = g - 1;
                            for (var r = f; r < l; ++r) {
                                e[r].stabbingCount--
                            }
                            this.Query([0], [0], h, i, e, c - 2, d)
                        }
                        for (var s = 0; s < this.m_queryResultCount; ++s) {
                            this.m_pairManager.RemoveBufferedPair(a, this.m_queryResults[s])
                        }
                        this.m_pairManager.Commit();
                        this.m_queryResultCount = 0;
                        this.IncrementTimeStamp();
                        b.userData = null;
                        b.overlapCount = b2BroadPhase.b2_invalid;
                        b.lowerBounds[0] = b2BroadPhase.b2_invalid;
                        b.lowerBounds[1] = b2BroadPhase.b2_invalid;
                        b.upperBounds[0] = b2BroadPhase.b2_invalid;
                        b.upperBounds[1] = b2BroadPhase.b2_invalid;
                        b.SetNext(this.m_freeProxy);
                        this.m_freeProxy = a;
                        --this.m_proxyCount
                    },
                    MoveProxy: function (a, b) {
                        var c = 0;
                        var d = 0;
                        var e;
                        var f;
                        var g;
                        var h = 0;
                        var i;
                        if (a == b2Pair.b2_nullProxy || b2Settings.b2_maxProxies <= a) {
                            return
                        }
                        if (b.IsValid() == false) {
                            return
                        }
                        var j = 2 * this.m_proxyCount;
                        var k = this.m_proxyPool[a];
                        var l = new b2BoundValues;
                        this.ComputeBounds(l.lowerValues, l.upperValues, b);
                        var m = new b2BoundValues;
                        for (c = 0; c < 2; ++c) {
                            m.lowerValues[c] = this.m_bounds[c][k.lowerBounds[c]].value;
                            m.upperValues[c] = this.m_bounds[c][k.upperBounds[c]].value
                        }
                        for (c = 0; c < 2; ++c) {
                            var n = this.m_bounds[c];
                            var o = k.lowerBounds[c];
                            var p = k.upperBounds[c];
                            var q = l.lowerValues[c];
                            var r = l.upperValues[c];
                            var s = q - n[o].value;
                            var t = r - n[p].value;
                            n[o].value = q;
                            n[p].value = r;
                            if (s < 0) {
                                d = o;
                                while (d > 0 && q < n[d - 1].value) {
                                    e = n[d];
                                    f = n[d - 1];
                                    var u = f.proxyId;
                                    var v = this.m_proxyPool[f.proxyId];
                                    f.stabbingCount++;
                                    if (f.IsUpper() == true) {
                                        if (this.TestOverlap(l, v)) {
                                            this.m_pairManager.AddBufferedPair(a, u)
                                        }
                                        v.upperBounds[c]++;
                                        e.stabbingCount++
                                    } else {
                                        v.lowerBounds[c]++;
                                        e.stabbingCount--
                                    }
                                    k.lowerBounds[c]--;
                                    e.Swap(f);
                                    --d
                                }
                            }
                            if (t > 0) {
                                d = p;
                                while (d < j - 1 && n[d + 1].value <= r) {
                                    e = n[d];
                                    g = n[d + 1];
                                    h = g.proxyId;
                                    i = this.m_proxyPool[h];
                                    g.stabbingCount++;
                                    if (g.IsLower() == true) {
                                        if (this.TestOverlap(l, i)) {
                                            this.m_pairManager.AddBufferedPair(a, h)
                                        }
                                        i.lowerBounds[c]--;
                                        e.stabbingCount++
                                    } else {
                                        i.upperBounds[c]--;
                                        e.stabbingCount--
                                    }
                                    k.upperBounds[c]++;
                                    e.Swap(g);
                                    d++
                                }
                            }
                            if (s > 0) {
                                d = o;
                                while (d < j - 1 && n[d + 1].value <= q) {
                                    e = n[d];
                                    g = n[d + 1];
                                    h = g.proxyId;
                                    i = this.m_proxyPool[h];
                                    g.stabbingCount--;
                                    if (g.IsUpper()) {
                                        if (this.TestOverlap(m, i)) {
                                            this.m_pairManager.RemoveBufferedPair(a, h)
                                        }
                                        i.upperBounds[c]--;
                                        e.stabbingCount--
                                    } else {
                                        i.lowerBounds[c]--;
                                        e.stabbingCount++
                                    }
                                    k.lowerBounds[c]++;
                                    e.Swap(g);
                                    d++
                                }
                            }
                            if (t < 0) {
                                d = p;
                                while (d > 0 && r < n[d - 1].value) {
                                    e = n[d];
                                    f = n[d - 1];
                                    u = f.proxyId;
                                    v = this.m_proxyPool[u];
                                    f.stabbingCount--;
                                    if (f.IsLower() == true) {
                                        if (this.TestOverlap(m, v)) {
                                            this.m_pairManager.RemoveBufferedPair(a, u)
                                        }
                                        v.lowerBounds[c]++;
                                        e.stabbingCount--
                                    } else {
                                        v.upperBounds[c]++;
                                        e.stabbingCount++
                                    }
                                    k.upperBounds[c]--;
                                    e.Swap(f);
                                    d--
                                }
                            }
                        }
                    },
                    Commit: function () {
                        this.m_pairManager.Commit()
                    },
                    QueryAABB: function (a, b, c) {
                        var d = new Array;
                        var e = new Array;
                        this.ComputeBounds(d, e, a);
                        var f = 0;
                        var g = 0;
                        var h = [f];
                        var i = [g];
                        this.Query(h, i, d[0], e[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
                        this.Query(h, i, d[1], e[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
                        var j = 0;
                        for (var k = 0; k < this.m_queryResultCount && j < c; ++k, ++j) {
                            var l = this.m_proxyPool[this.m_queryResults[k]];
                            b[k] = l.userData
                        }
                        this.m_queryResultCount = 0;
                        this.IncrementTimeStamp();
                        return j
                    },
                    Validate: function () {
                        var a;
                        var b;
                        var c;
                        var d;
                        for (var e = 0; e < 2; ++e) {
                            var f = this.m_bounds[e];
                            var g = 2 * this.m_proxyCount;
                            var h = 0;
                            for (var i = 0; i < g; ++i) {
                                var j = f[i];
                                if (j.IsLower() == true) {
                                    h++
                                } else {
                                    h--
                                }
                            }
                        }
                    },
                    ComputeBounds: function (a, b, c) {
                        var d = c.minVertex.x;
                        var e = c.minVertex.y;
                        d = b2Math.b2Min(d, this.m_worldAABB.maxVertex.x);
                        e = b2Math.b2Min(e, this.m_worldAABB.maxVertex.y);
                        d = b2Math.b2Max(d, this.m_worldAABB.minVertex.x);
                        e = b2Math.b2Max(e, this.m_worldAABB.minVertex.y);
                        var f = c.maxVertex.x;
                        var g = c.maxVertex.y;
                        f = b2Math.b2Min(f, this.m_worldAABB.maxVertex.x);
                        g = b2Math.b2Min(g, this.m_worldAABB.maxVertex.y);
                        f = b2Math.b2Max(f, this.m_worldAABB.minVertex.x);
                        g = b2Math.b2Max(g, this.m_worldAABB.minVertex.y);
                        a[0] = this.m_quantizationFactor.x * (d - this.m_worldAABB.minVertex.x) & b2Settings.USHRT_MAX - 1;
                        b[0] = this.m_quantizationFactor.x * (f - this.m_worldAABB.minVertex.x) & 65535 | 1;
                        a[1] = this.m_quantizationFactor.y * (e - this.m_worldAABB.minVertex.y) & b2Settings.USHRT_MAX - 1;
                        b[1] = this.m_quantizationFactor.y * (g - this.m_worldAABB.minVertex.y) & 65535 | 1
                    },
                    TestOverlapValidate: function (a, b) {
                        for (var c = 0; c < 2; ++c) {
                            var d = this.m_bounds[c];
                            if (d[a.lowerBounds[c]].value > d[b.upperBounds[c]].value)return false;
                            if (d[a.upperBounds[c]].value < d[b.lowerBounds[c]].value)return false
                        }
                        return true
                    },
                    TestOverlap: function (a, b) {
                        for (var c = 0; c < 2; ++c) {
                            var d = this.m_bounds[c];
                            if (a.lowerValues[c] > d[b.upperBounds[c]].value)return false;
                            if (a.upperValues[c] < d[b.lowerBounds[c]].value)return false
                        }
                        return true
                    },
                    Query: function (a, b, c, d, e, f, g) {
                        var h = b2BroadPhase.BinarySearch(e, f, c);
                        var i = b2BroadPhase.BinarySearch(e, f, d);
                        for (var j = h; j < i; ++j) {
                            if (e[j].IsLower()) {
                                this.IncrementOverlapCount(e[j].proxyId)
                            }
                        }
                        if (h > 0) {
                            var k = h - 1;
                            var l = e[k].stabbingCount;
                            while (l) {
                                if (e[k].IsLower()) {
                                    var m = this.m_proxyPool[e[k].proxyId];
                                    if (h <= m.upperBounds[g]) {
                                        this.IncrementOverlapCount(e[k].proxyId);
                                        --l
                                    }
                                }
                                --k
                            }
                        }
                        a[0] = h;
                        b[0] = i
                    },
                    IncrementOverlapCount: function (a) {
                        var b = this.m_proxyPool[a];
                        if (b.timeStamp < this.m_timeStamp) {
                            b.timeStamp = this.m_timeStamp;
                            b.overlapCount = 1
                        } else {
                            b.overlapCount = 2;
                            this.m_queryResults[this.m_queryResultCount] = a;
                            ++this.m_queryResultCount
                        }
                    },
                    IncrementTimeStamp: function () {
                        if (this.m_timeStamp == b2Settings.USHRT_MAX) {
                            for (var a = 0; a < b2Settings.b2_maxProxies; ++a) {
                                this.m_proxyPool[a].timeStamp = 0
                            }
                            this.m_timeStamp = 1
                        } else {
                            ++this.m_timeStamp
                        }
                    },
                    m_pairManager: new b2PairManager,
                    m_proxyPool: new Array(b2Settings.b2_maxPairs),
                    m_freeProxy: 0,
                    m_bounds: new Array(2 * b2Settings.b2_maxProxies),
                    m_queryResults: new Array(b2Settings.b2_maxProxies),
                    m_queryResultCount: 0,
                    m_worldAABB: null,
                    m_quantizationFactor: new b2Vec2,
                    m_proxyCount: 0,
                    m_timeStamp: 0
                };
                b2BroadPhase.s_validate = false;
                b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
                b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;
                b2BroadPhase.BinarySearch = function (a, b, c) {
                    var d = 0;
                    var e = b - 1;
                    while (d <= e) {
                        var f = Math.floor((d + e) / 2);
                        if (a[f].value > c) {
                            e = f - 1
                        } else if (a[f].value < c) {
                            d = f + 1
                        } else {
                            return f
                        }
                    }
                    return d
                };
                var b2Collision = Class.create();
                b2Collision.prototype = {
                    initialize: function () {
                    }
                };
                b2Collision.b2_nullFeature = 255;
                b2Collision.ClipSegmentToLine = function (a, b, c, d) {
                    var e = 0;
                    var f = b[0].v;
                    var g = b[1].v;
                    var h = b2Math.b2Dot(c, b[0].v) - d;
                    var i = b2Math.b2Dot(c, b[1].v) - d;
                    if (h <= 0)a[e++] = b[0];
                    if (i <= 0)a[e++] = b[1];
                    if (h * i < 0) {
                        var j = h / (h - i);
                        var k = a[e].v;
                        k.x = f.x + j * (g.x - f.x);
                        k.y = f.y + j * (g.y - f.y);
                        if (h > 0) {
                            a[e].id = b[0].id
                        } else {
                            a[e].id = b[1].id
                        }
                        ++e
                    }
                    return e
                };
                b2Collision.EdgeSeparation = function (a, b, c) {
                    var d = a.m_vertices;
                    var e = c.m_vertexCount;
                    var f = c.m_vertices;
                    var g = a.m_normals[b].x;
                    var h = a.m_normals[b].y;
                    var i = g;
                    var j = a.m_R;
                    g = j.col1.x * i + j.col2.x * h;
                    h = j.col1.y * i + j.col2.y * h;
                    var k = g;
                    var l = h;
                    j = c.m_R;
                    i = k * j.col1.x + l * j.col1.y;
                    l = k * j.col2.x + l * j.col2.y;
                    k = i;
                    var m = 0;
                    var n = Number.MAX_VALUE;
                    for (var o = 0; o < e; ++o) {
                        var p = f[o];
                        var q = p.x * k + p.y * l;
                        if (q < n) {
                            n = q;
                            m = o
                        }
                    }
                    j = a.m_R;
                    var r = a.m_position.x + (j.col1.x * d[b].x + j.col2.x * d[b].y);
                    var s = a.m_position.y + (j.col1.y * d[b].x + j.col2.y * d[b].y);
                    j = c.m_R;
                    var t = c.m_position.x + (j.col1.x * f[m].x + j.col2.x * f[m].y);
                    var u = c.m_position.y + (j.col1.y * f[m].x + j.col2.y * f[m].y);
                    t -= r;
                    u -= s;
                    var v = t * g + u * h;
                    return v
                };
                b2Collision.FindMaxSeparation = function (a, b, c, d) {
                    var e = b.m_vertexCount;
                    var f = c.m_position.x - b.m_position.x;
                    var g = c.m_position.y - b.m_position.y;
                    var h = f * b.m_R.col1.x + g * b.m_R.col1.y;
                    var i = f * b.m_R.col2.x + g * b.m_R.col2.y;
                    var j = 0;
                    var k = -Number.MAX_VALUE;
                    for (var l = 0; l < e; ++l) {
                        var m = b.m_normals[l].x * h + b.m_normals[l].y * i;
                        if (m > k) {
                            k = m;
                            j = l
                        }
                    }
                    var n = b2Collision.EdgeSeparation(b, j, c);
                    if (n > 0 && d == false) {
                        return n
                    }
                    var o = j - 1 >= 0 ? j - 1 : e - 1;
                    var p = b2Collision.EdgeSeparation(b, o, c);
                    if (p > 0 && d == false) {
                        return p
                    }
                    var q = j + 1 < e ? j + 1 : 0;
                    var r = b2Collision.EdgeSeparation(b, q, c);
                    if (r > 0 && d == false) {
                        return r
                    }
                    var s = 0;
                    var t;
                    var u = 0;
                    if (p > n && p > r) {
                        u = -1;
                        s = o;
                        t = p
                    } else if (r > n) {
                        u = 1;
                        s = q;
                        t = r
                    } else {
                        a[0] = j;
                        return n
                    }
                    while (true) {
                        if (u == -1)j = s - 1 >= 0 ? s - 1 : e - 1; else j = s + 1 < e ? s + 1 : 0;
                        n = b2Collision.EdgeSeparation(b, j, c);
                        if (n > 0 && d == false) {
                            return n
                        }
                        if (n > t) {
                            s = j;
                            t = n
                        } else {
                            break
                        }
                    }
                    a[0] = s;
                    return t
                };
                b2Collision.FindIncidentEdge = function (a, b, c, d) {
                    var e = b.m_vertexCount;
                    var f = b.m_vertices;
                    var g = d.m_vertexCount;
                    var h = d.m_vertices;
                    var i = c;
                    var j = c + 1 == e ? 0 : c + 1;
                    var k = f[j];
                    var l = k.x;
                    var m = k.y;
                    k = f[i];
                    l -= k.x;
                    m -= k.y;
                    var n = l;
                    l = m;
                    m = -n;
                    var o = 1 / Math.sqrt(l * l + m * m);
                    l *= o;
                    m *= o;
                    var p = l;
                    var q = m;
                    n = p;
                    var r = b.m_R;
                    p = r.col1.x * n + r.col2.x * q;
                    q = r.col1.y * n + r.col2.y * q;
                    var s = p;
                    var t = q;
                    r = d.m_R;
                    n = s * r.col1.x + t * r.col1.y;
                    t = s * r.col2.x + t * r.col2.y;
                    s = n;
                    var u = 0;
                    var v = 0;
                    var w = Number.MAX_VALUE;
                    for (var x = 0; x < g; ++x) {
                        var y = x;
                        var z = x + 1 < g ? x + 1 : 0;
                        k = h[z];
                        var A = k.x;
                        var B = k.y;
                        k = h[y];
                        A -= k.x;
                        B -= k.y;
                        n = A;
                        A = B;
                        B = -n;
                        o = 1 / Math.sqrt(A * A + B * B);
                        A *= o;
                        B *= o;
                        var C = A * s + B * t;
                        if (C < w) {
                            w = C;
                            u = y;
                            v = z
                        }
                    }
                    var D;
                    D = a[0];
                    k = D.v;
                    k.SetV(h[u]);
                    k.MulM(d.m_R);
                    k.Add(d.m_position);
                    D.id.features.referenceFace = c;
                    D.id.features.incidentEdge = u;
                    D.id.features.incidentVertex = u;
                    D = a[1];
                    k = D.v;
                    k.SetV(h[v]);
                    k.MulM(d.m_R);
                    k.Add(d.m_position);
                    D.id.features.referenceFace = c;
                    D.id.features.incidentEdge = u;
                    D.id.features.incidentVertex = v
                };
                b2Collision.b2CollidePolyTempVec = new b2Vec2;
                b2Collision.b2CollidePoly = function (a, b, c, d) {
                    a.pointCount = 0;
                    var e = 0;
                    var f = [e];
                    var g = b2Collision.FindMaxSeparation(f, b, c, d);
                    e = f[0];
                    if (g > 0 && d == false)return;
                    var h = 0;
                    var i = [h];
                    var j = b2Collision.FindMaxSeparation(i, c, b, d);
                    h = i[0];
                    if (j > 0 && d == false)return;
                    var k;
                    var l;
                    var m = 0;
                    var n = 0;
                    var o = .98;
                    var p = .001;
                    if (j > o * g + p) {
                        k = c;
                        l = b;
                        m = h;
                        n = 1
                    } else {
                        k = b;
                        l = c;
                        m = e;
                        n = 0
                    }
                    var q = [new ClipVertex, new ClipVertex];
                    b2Collision.FindIncidentEdge(q, k, m, l);
                    var r = k.m_vertexCount;
                    var s = k.m_vertices;
                    var t = s[m];
                    var u = m + 1 < r ? s[m + 1] : s[0];
                    var v = u.x - t.x;
                    var w = u.y - t.y;
                    var x = u.x - t.x;
                    var y = u.y - t.y;
                    var z = x;
                    var A = k.m_R;
                    x = A.col1.x * z + A.col2.x * y;
                    y = A.col1.y * z + A.col2.y * y;
                    var B = 1 / Math.sqrt(x * x + y * y);
                    x *= B;
                    y *= B;
                    var C = x;
                    var D = y;
                    z = C;
                    C = D;
                    D = -z;
                    var E = t.x;
                    var F = t.y;
                    z = E;
                    A = k.m_R;
                    E = A.col1.x * z + A.col2.x * F;
                    F = A.col1.y * z + A.col2.y * F;
                    E += k.m_position.x;
                    F += k.m_position.y;
                    var G = u.x;
                    var H = u.y;
                    z = G;
                    A = k.m_R;
                    G = A.col1.x * z + A.col2.x * H;
                    H = A.col1.y * z + A.col2.y * H;
                    G += k.m_position.x;
                    H += k.m_position.y;
                    var I = C * E + D * F;
                    var J = -(x * E + y * F);
                    var K = x * G + y * H;
                    var L = [new ClipVertex, new ClipVertex];
                    var M = [new ClipVertex, new ClipVertex];
                    var N = 0;
                    b2Collision.b2CollidePolyTempVec.Set(-x, -y);
                    N = b2Collision.ClipSegmentToLine(L, q, b2Collision.b2CollidePolyTempVec, J);
                    if (N < 2)return;
                    b2Collision.b2CollidePolyTempVec.Set(x, y);
                    N = b2Collision.ClipSegmentToLine(M, L, b2Collision.b2CollidePolyTempVec, K);
                    if (N < 2)return;
                    if (n) {
                        a.normal.Set(-C, -D)
                    } else {
                        a.normal.Set(C, D)
                    }
                    var O = 0;
                    for (var P = 0; P < b2Settings.b2_maxManifoldPoints; ++P) {
                        var Q = M[P].v;
                        var R = C * Q.x + D * Q.y - I;
                        if (R <= 0 || d == true) {
                            var S = a.points[O];
                            S.separation = R;
                            S.position.SetV(M[P].v);
                            S.id.Set(M[P].id);
                            S.id.features.flip = n;
                            ++O
                        }
                    }
                    a.pointCount = O
                };
                b2Collision.b2CollideCircle = function (a, b, c, d) {
                    a.pointCount = 0;
                    var e = c.m_position.x - b.m_position.x;
                    var f = c.m_position.y - b.m_position.y;
                    var g = e * e + f * f;
                    var h = b.m_radius + c.m_radius;
                    if (g > h * h && d == false) {
                        return
                    }
                    var i;
                    if (g < Number.MIN_VALUE) {
                        i = -h;
                        a.normal.Set(0, 1)
                    } else {
                        var j = Math.sqrt(g);
                        i = j - h;
                        var k = 1 / j;
                        a.normal.x = k * e;
                        a.normal.y = k * f
                    }
                    a.pointCount = 1;
                    var l = a.points[0];
                    l.id.set_key(0);
                    l.separation = i;
                    l.position.x = c.m_position.x - c.m_radius * a.normal.x;
                    l.position.y = c.m_position.y - c.m_radius * a.normal.y
                };
                b2Collision.b2CollidePolyAndCircle = function (a, b, c, d) {
                    a.pointCount = 0;
                    var e;
                    var f;
                    var g;
                    var h = c.m_position.x - b.m_position.x;
                    var i = c.m_position.y - b.m_position.y;
                    var j = b.m_R;
                    var k = h * j.col1.x + i * j.col1.y;
                    i = h * j.col2.x + i * j.col2.y;
                    h = k;
                    var l;
                    var m = 0;
                    var n = -Number.MAX_VALUE;
                    var o = c.m_radius;
                    for (var p = 0; p < b.m_vertexCount; ++p) {
                        var q = b.m_normals[p].x * (h - b.m_vertices[p].x) + b.m_normals[p].y * (i - b.m_vertices[p].y);
                        if (q > o) {
                            return
                        }
                        if (q > n) {
                            n = q;
                            m = p
                        }
                    }
                    if (n < Number.MIN_VALUE) {
                        a.pointCount = 1;
                        var r = b.m_normals[m];
                        a.normal.x = j.col1.x * r.x + j.col2.x * r.y;
                        a.normal.y = j.col1.y * r.x + j.col2.y * r.y;
                        e = a.points[0];
                        e.id.features.incidentEdge = m;
                        e.id.features.incidentVertex = b2Collision.b2_nullFeature;
                        e.id.features.referenceFace = b2Collision.b2_nullFeature;
                        e.id.features.flip = 0;
                        e.position.x = c.m_position.x - o * a.normal.x;
                        e.position.y = c.m_position.y - o * a.normal.y;
                        e.separation = n - o;
                        return
                    }
                    var s = m;
                    var t = s + 1 < b.m_vertexCount ? s + 1 : 0;
                    var u = b.m_vertices[t].x - b.m_vertices[s].x;
                    var v = b.m_vertices[t].y - b.m_vertices[s].y;
                    var w = Math.sqrt(u * u + v * v);
                    u /= w;
                    v /= w;
                    if (w < Number.MIN_VALUE) {
                        f = h - b.m_vertices[s].x;
                        g = i - b.m_vertices[s].y;
                        l = Math.sqrt(f * f + g * g);
                        f /= l;
                        g /= l;
                        if (l > o) {
                            return
                        }
                        a.pointCount = 1;
                        a.normal.Set(j.col1.x * f + j.col2.x * g, j.col1.y * f + j.col2.y * g);
                        e = a.points[0];
                        e.id.features.incidentEdge = b2Collision.b2_nullFeature;
                        e.id.features.incidentVertex = s;
                        e.id.features.referenceFace = b2Collision.b2_nullFeature;
                        e.id.features.flip = 0;
                        e.position.x = c.m_position.x - o * a.normal.x;
                        e.position.y = c.m_position.y - o * a.normal.y;
                        e.separation = l - o;
                        return
                    }
                    var x = (h - b.m_vertices[s].x) * u + (i - b.m_vertices[s].y) * v;
                    e = a.points[0];
                    e.id.features.incidentEdge = b2Collision.b2_nullFeature;
                    e.id.features.incidentVertex = b2Collision.b2_nullFeature;
                    e.id.features.referenceFace = b2Collision.b2_nullFeature;
                    e.id.features.flip = 0;
                    var y, z;
                    if (x <= 0) {
                        y = b.m_vertices[s].x;
                        z = b.m_vertices[s].y;
                        e.id.features.incidentVertex = s
                    } else if (x >= w) {
                        y = b.m_vertices[t].x;
                        z = b.m_vertices[t].y;
                        e.id.features.incidentVertex = t
                    } else {
                        y = u * x + b.m_vertices[s].x;
                        z = v * x + b.m_vertices[s].y;
                        e.id.features.incidentEdge = s
                    }
                    f = h - y;
                    g = i - z;
                    l = Math.sqrt(f * f + g * g);
                    f /= l;
                    g /= l;
                    if (l > o) {
                        return
                    }
                    a.pointCount = 1;
                    a.normal.Set(j.col1.x * f + j.col2.x * g, j.col1.y * f + j.col2.y * g);
                    e.position.x = c.m_position.x - o * a.normal.x;
                    e.position.y = c.m_position.y - o * a.normal.y;
                    e.separation = l - o
                };
                b2Collision.b2TestOverlap = function (a, b) {
                    var c = b.minVertex;
                    var d = a.maxVertex;
                    var e = c.x - d.x;
                    var f = c.y - d.y;
                    c = a.minVertex;
                    d = b.maxVertex;
                    var g = c.x - d.x;
                    var h = c.y - d.y;
                    if (e > 0 || f > 0)return false;
                    if (g > 0 || h > 0)return false;
                    return true
                };
                var Features = Class.create();
                Features.prototype = {
                    set_referenceFace: function (a) {
                        this._referenceFace = a;
                        this._m_id._key = this._m_id._key & 4294967040 | this._referenceFace & 255
                    }, get_referenceFace: function () {
                        return this._referenceFace
                    }, _referenceFace: 0, set_incidentEdge: function (a) {
                        this._incidentEdge = a;
                        this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280
                    }, get_incidentEdge: function () {
                        return this._incidentEdge
                    }, _incidentEdge: 0, set_incidentVertex: function (a) {
                        this._incidentVertex = a;
                        this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680
                    }, get_incidentVertex: function () {
                        return this._incidentVertex
                    }, _incidentVertex: 0, set_flip: function (a) {
                        this._flip = a;
                        this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080
                    }, get_flip: function () {
                        return this._flip
                    }, _flip: 0, _m_id: null, initialize: function () {
                    }
                };
                var b2ContactID = Class.create();
                b2ContactID.prototype = {
                    initialize: function () {
                        this.features = new Features;
                        this.features._m_id = this
                    }, Set: function (a) {
                        this.set_key(a._key)
                    }, Copy: function () {
                        var a = new b2ContactID;
                        a.set_key(this._key);
                        return a
                    }, get_key: function () {
                        return this._key
                    }, set_key: function (a) {
                        this._key = a;
                        this.features._referenceFace = this._key & 255;
                        this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
                        this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
                        this.features._flip = (this._key & 4278190080) >> 24 & 255
                    }, features: new Features, _key: 0
                };
                var b2ContactPoint = Class.create();
                b2ContactPoint.prototype = {
                    position: new b2Vec2,
                    separation: null,
                    normalImpulse: null,
                    tangentImpulse: null,
                    id: new b2ContactID,
                    initialize: function () {
                        this.position = new b2Vec2;
                        this.id = new b2ContactID
                    }
                };
                var b2Distance = Class.create();
                b2Distance.prototype = {
                    initialize: function () {
                    }
                };
                b2Distance.ProcessTwo = function (a, b, c, d, e) {
                    var f = -e[1].x;
                    var g = -e[1].y;
                    var h = e[0].x - e[1].x;
                    var i = e[0].y - e[1].y;
                    var j = Math.sqrt(h * h + i * i);
                    h /= j;
                    i /= j;
                    var k = f * h + g * i;
                    if (k <= 0 || j < Number.MIN_VALUE) {
                        a.SetV(c[1]);
                        b.SetV(d[1]);
                        c[0].SetV(c[1]);
                        d[0].SetV(d[1]);
                        e[0].SetV(e[1]);
                        return 1
                    }
                    k /= j;
                    a.x = c[1].x + k * (c[0].x - c[1].x);
                    a.y = c[1].y + k * (c[0].y - c[1].y);
                    b.x = d[1].x + k * (d[0].x - d[1].x);
                    b.y = d[1].y + k * (d[0].y - d[1].y);
                    return 2
                };
                b2Distance.ProcessThree = function (a, b, c, d, e) {
                    var f = e[0].x;
                    var g = e[0].y;
                    var h = e[1].x;
                    var i = e[1].y;
                    var j = e[2].x;
                    var k = e[2].y;
                    var l = h - f;
                    var m = i - g;
                    var n = j - f;
                    var o = k - g;
                    var p = j - h;
                    var q = k - i;
                    var r = -(f * l + g * m);
                    var s = h * l + i * m;
                    var t = -(f * n + g * o);
                    var u = j * n + k * o;
                    var v = -(h * p + i * q);
                    var w = j * p + k * q;
                    if (u <= 0 && w <= 0) {
                        a.SetV(c[2]);
                        b.SetV(d[2]);
                        c[0].SetV(c[2]);
                        d[0].SetV(d[2]);
                        e[0].SetV(e[2]);
                        return 1
                    }
                    var x = l * o - m * n;
                    var y = x * (f * i - g * h);
                    var z = x * (h * k - i * j);
                    if (z <= 0 && v >= 0 && w >= 0) {
                        var A = v / (v + w);
                        a.x = c[1].x + A * (c[2].x - c[1].x);
                        a.y = c[1].y + A * (c[2].y - c[1].y);
                        b.x = d[1].x + A * (d[2].x - d[1].x);
                        b.y = d[1].y + A * (d[2].y - d[1].y);
                        c[0].SetV(c[2]);
                        d[0].SetV(d[2]);
                        e[0].SetV(e[2]);
                        return 2
                    }
                    var B = x * (j * g - k * f);
                    if (B <= 0 && t >= 0 && u >= 0) {
                        var A = t / (t + u);
                        a.x = c[0].x + A * (c[2].x - c[0].x);
                        a.y = c[0].y + A * (c[2].y - c[0].y);
                        b.x = d[0].x + A * (d[2].x - d[0].x);
                        b.y = d[0].y + A * (d[2].y - d[0].y);
                        c[1].SetV(c[2]);
                        d[1].SetV(d[2]);
                        e[1].SetV(e[2]);
                        return 2
                    }
                    var C = z + B + y;
                    C = 1 / C;
                    var D = z * C;
                    var E = B * C;
                    var F = 1 - D - E;
                    a.x = D * c[0].x + E * c[1].x + F * c[2].x;
                    a.y = D * c[0].y + E * c[1].y + F * c[2].y;
                    b.x = D * d[0].x + E * d[1].x + F * d[2].x;
                    b.y = D * d[0].y + E * d[1].y + F * d[2].y;
                    return 3
                };
                b2Distance.InPoinsts = function (a, b, c) {
                    for (var d = 0; d < c; ++d) {
                        if (a.x == b[d].x && a.y == b[d].y) {
                            return true
                        }
                    }
                    return false
                };
                b2Distance.Distance = function (a, b, c, d) {
                    var e = new Array(3);
                    var f = new Array(3);
                    var g = new Array(3);
                    var h = 0;
                    a.SetV(c.m_position);
                    b.SetV(d.m_position);
                    var i = 0;
                    var j = 20;
                    for (var k = 0; k < j; ++k) {
                        var l = b.x - a.x;
                        var m = b.y - a.y;
                        var n = c.Support(l, m);
                        var o = d.Support(-l, -m);
                        i = l * l + m * m;
                        var p = o.x - n.x;
                        var q = o.y - n.y;
                        var r = l * p + m * q;
                        if (i - b2Dot(l * p + m * q) <= .01 * i) {
                            if (h == 0) {
                                a.SetV(n);
                                b.SetV(o)
                            }
                            b2Distance.g_GJK_Iterations = k;
                            return Math.sqrt(i)
                        }
                        switch (h) {
                            case 0:
                                e[0].SetV(n);
                                f[0].SetV(o);
                                g[0] = w;
                                a.SetV(e[0]);
                                b.SetV(f[0]);
                                ++h;
                                break;
                            case 1:
                                e[1].SetV(n);
                                f[1].SetV(o);
                                g[1].x = p;
                                g[1].y = q;
                                h = b2Distance.ProcessTwo(a, b, e, f, g);
                                break;
                            case 2:
                                e[2].SetV(n);
                                f[2].SetV(o);
                                g[2].x = p;
                                g[2].y = q;
                                h = b2Distance.ProcessThree(a, b, e, f, g);
                                break
                        }
                        if (h == 3) {
                            b2Distance.g_GJK_Iterations = k;
                            return 0
                        }
                        var s = -Number.MAX_VALUE;
                        for (var t = 0; t < h; ++t) {
                            s = b2Math.b2Max(s, g[t].x * g[t].x + g[t].y * g[t].y)
                        }
                        if (h == 3 || i <= 100 * Number.MIN_VALUE * s) {
                            b2Distance.g_GJK_Iterations = k;
                            return Math.sqrt(i)
                        }
                    }
                    b2Distance.g_GJK_Iterations = j;
                    return Math.sqrt(i)
                };
                b2Distance.g_GJK_Iterations = 0;
                var b2Manifold = Class.create();
                b2Manifold.prototype = {
                    initialize: function () {
                        this.points = new Array(b2Settings.b2_maxManifoldPoints);
                        for (var a = 0; a < b2Settings.b2_maxManifoldPoints; a++) {
                            this.points[a] = new b2ContactPoint
                        }
                        this.normal = new b2Vec2
                    }, points: null, normal: null, pointCount: 0
                };
                var b2OBB = Class.create();
                b2OBB.prototype = {
                    R: new b2Mat22, center: new b2Vec2, extents: new b2Vec2, initialize: function () {
                        this.R = new b2Mat22;
                        this.center = new b2Vec2;
                        this.extents = new b2Vec2
                    }
                };
                var b2Proxy = Class.create();
                b2Proxy.prototype = {
                    GetNext: function () {
                        return this.lowerBounds[0]
                    },
                    SetNext: function (a) {
                        this.lowerBounds[0] = a
                    },
                    IsValid: function () {
                        return this.overlapCount != b2BroadPhase.b2_invalid
                    },
                    lowerBounds: [0, 0],
                    upperBounds: [0, 0],
                    overlapCount: 0,
                    timeStamp: 0,
                    userData: null,
                    initialize: function () {
                        this.lowerBounds = [0, 0];
                        this.upperBounds = [0, 0]
                    }
                };
                var ClipVertex = Class.create();
                ClipVertex.prototype = {
                    v: new b2Vec2, id: new b2ContactID, initialize: function () {
                        this.v = new b2Vec2;
                        this.id = new b2ContactID
                    }
                };
                var b2Shape = Class.create();
                b2Shape.prototype = {
                    TestPoint: function (a) {
                        return false
                    },
                    GetUserData: function () {
                        return this.m_userData
                    },
                    GetType: function () {
                        return this.m_type
                    },
                    GetBody: function () {
                        return this.m_body
                    },
                    GetPosition: function () {
                        return this.m_position
                    },
                    GetRotationMatrix: function () {
                        return this.m_R
                    },
                    ResetProxy: function (a) {
                    },
                    GetNext: function () {
                        return this.m_next
                    },
                    initialize: function (a, b) {
                        this.m_R = new b2Mat22;
                        this.m_position = new b2Vec2;
                        this.m_userData = a.userData;
                        this.m_friction = a.friction;
                        this.m_restitution = a.restitution;
                        this.m_body = b;
                        this.m_proxyId = b2Pair.b2_nullProxy;
                        this.m_maxRadius = 0;
                        this.m_categoryBits = a.categoryBits;
                        this.m_maskBits = a.maskBits;
                        this.m_groupIndex = a.groupIndex
                    },
                    DestroyProxy: function () {
                        if (this.m_proxyId != b2Pair.b2_nullProxy) {
                            this.m_body.m_world.m_broadPhase.DestroyProxy(this.m_proxyId);
                            this.m_proxyId = b2Pair.b2_nullProxy
                        }
                    },
                    Synchronize: function (a, b, c, d) {
                    },
                    QuickSync: function (a, b) {
                    },
                    Support: function (a, b, c) {
                    },
                    GetMaxRadius: function () {
                        return this.m_maxRadius
                    },
                    m_next: null,
                    m_R: new b2Mat22,
                    m_position: new b2Vec2,
                    m_type: 0,
                    m_userData: null,
                    m_body: null,
                    m_friction: null,
                    m_restitution: null,
                    m_maxRadius: null,
                    m_proxyId: 0,
                    m_categoryBits: 0,
                    m_maskBits: 0,
                    m_groupIndex: 0
                };
                b2Shape.Create = function (a, b, c) {
                    switch (a.type) {
                        case b2Shape.e_circleShape: {
                            return new b2CircleShape(a, b, c)
                        }
                            ;
                        case b2Shape.e_boxShape:
                        case b2Shape.e_polyShape: {
                            return new b2PolyShape(a, b, c)
                        }
                    }
                    return null
                };
                b2Shape.Destroy = function (a) {
                    if (a.m_proxyId != b2Pair.b2_nullProxy)a.m_body.m_world.m_broadPhase.DestroyProxy(a.m_proxyId)
                };
                b2Shape.e_unknownShape = -1;
                b2Shape.e_circleShape = 0;
                b2Shape.e_boxShape = 1;
                b2Shape.e_polyShape = 2;
                b2Shape.e_meshShape = 3;
                b2Shape.e_shapeTypeCount = 4;
                b2Shape.PolyMass = function (a, b, c, d) {
                    var e = new b2Vec2;
                    e.SetZero();
                    var f = 0;
                    var g = 0;
                    var h = new b2Vec2(0, 0);
                    var i = 1 / 3;
                    for (var j = 0; j < c; ++j) {
                        var k = h;
                        var l = b[j];
                        var m = j + 1 < c ? b[j + 1] : b[0];
                        var n = b2Math.SubtractVV(l, k);
                        var o = b2Math.SubtractVV(m, k);
                        var p = b2Math.b2CrossVV(n, o);
                        var q = .5 * p;
                        f += q;
                        var r = new b2Vec2;
                        r.SetV(k);
                        r.Add(l);
                        r.Add(m);
                        r.Multiply(i * q);
                        e.Add(r);
                        var s = k.x;
                        var t = k.y;
                        var u = n.x;
                        var v = n.y;
                        var w = o.x;
                        var x = o.y;
                        var y = i * (.25 * (u * u + w * u + w * w) + (s * u + s * w)) + .5 * s * s;
                        var z = i * (.25 * (v * v + x * v + x * x) + (t * v + t * x)) + .5 * t * t;
                        g += p * (y + z)
                    }
                    a.mass = d * f;
                    e.Multiply(1 / f);
                    a.center = e;
                    g = d * (g - f * b2Math.b2Dot(e, e));
                    a.I = g
                };
                b2Shape.PolyCentroid = function (a, b, c) {
                    var d = 0;
                    var e = 0;
                    var f = 0;
                    var g = 0;
                    var h = 0;
                    var i = 1 / 3;
                    for (var j = 0; j < b; ++j) {
                        var k = g;
                        var l = h;
                        var m = a[j].x;
                        var n = a[j].y;
                        var o = j + 1 < b ? a[j + 1].x : a[0].x;
                        var p = j + 1 < b ? a[j + 1].y : a[0].y;
                        var q = m - k;
                        var r = n - l;
                        var s = o - k;
                        var t = p - l;
                        var u = q * t - r * s;
                        var v = .5 * u;
                        f += v;
                        d += v * i * (k + m + o);
                        e += v * i * (l + n + p)
                    }
                    d *= 1 / f;
                    e *= 1 / f;
                    c.Set(d, e)
                };
                var b2ShapeDef = Class.create();
                b2ShapeDef.prototype = {
                    initialize: function () {
                        this.type = b2Shape.e_unknownShape;
                        this.userData = null;
                        this.localPosition = new b2Vec2(0, 0);
                        this.localRotation = 0;
                        this.friction = .2;
                        this.restitution = 0;
                        this.density = 0;
                        this.categoryBits = 1;
                        this.maskBits = 65535;
                        this.groupIndex = 0
                    },
                    ComputeMass: function (a) {
                        a.center = new b2Vec2(0, 0);
                        if (this.density == 0) {
                            a.mass = 0;
                            a.center.Set(0, 0);
                            a.I = 0
                        }
                        switch (this.type) {
                            case b2Shape.e_circleShape: {
                                var b = this;
                                a.mass = this.density * b2Settings.b2_pi * b.radius * b.radius;
                                a.center.Set(0, 0);
                                a.I = .5 * a.mass * b.radius * b.radius
                            }
                                break;
                            case b2Shape.e_boxShape: {
                                var c = this;
                                a.mass = 4 * this.density * c.extents.x * c.extents.y;
                                a.center.Set(0, 0);
                                a.I = a.mass / 3 * b2Math.b2Dot(c.extents, c.extents)
                            }
                                break;
                            case b2Shape.e_polyShape: {
                                var d = this;
                                b2Shape.PolyMass(a, d.vertices, d.vertexCount, this.density)
                            }
                                break;
                            default:
                                a.mass = 0;
                                a.center.Set(0, 0);
                                a.I = 0;
                                break
                        }
                    },
                    type: 0,
                    userData: null,
                    localPosition: null,
                    localRotation: null,
                    friction: null,
                    restitution: null,
                    density: null,
                    categoryBits: 0,
                    maskBits: 0,
                    groupIndex: 0
                };
                var b2BoxDef = Class.create();
                Object.extend(b2BoxDef.prototype, b2ShapeDef.prototype);
                Object.extend(b2BoxDef.prototype, {
                    initialize: function () {
                        this.type = b2Shape.e_unknownShape;
                        this.userData = null;
                        this.localPosition = new b2Vec2(0, 0);
                        this.localRotation = 0;
                        this.friction = .2;
                        this.restitution = 0;
                        this.density = 0;
                        this.categoryBits = 1;
                        this.maskBits = 65535;
                        this.groupIndex = 0;
                        this.type = b2Shape.e_boxShape;
                        this.extents = new b2Vec2(1, 1)
                    }, extents: null
                });
                var b2CircleDef = Class.create();
                Object.extend(b2CircleDef.prototype, b2ShapeDef.prototype);
                Object.extend(b2CircleDef.prototype, {
                    initialize: function () {
                        this.type = b2Shape.e_unknownShape;
                        this.userData = null;
                        this.localPosition = new b2Vec2(0, 0);
                        this.localRotation = 0;
                        this.friction = .2;
                        this.restitution = 0;
                        this.density = 0;
                        this.categoryBits = 1;
                        this.maskBits = 65535;
                        this.groupIndex = 0;
                        this.type = b2Shape.e_circleShape;
                        this.radius = 1
                    }, radius: null
                });
                var b2CircleShape = Class.create();
                Object.extend(b2CircleShape.prototype, b2Shape.prototype);
                Object.extend(b2CircleShape.prototype, {
                    TestPoint: function (a) {
                        var b = new b2Vec2;
                        b.SetV(a);
                        b.Subtract(this.m_position);
                        return b2Math.b2Dot(b, b) <= this.m_radius * this.m_radius
                    }, initialize: function (a, b, c) {
                        this.m_R = new b2Mat22;
                        this.m_position = new b2Vec2;
                        this.m_userData = a.userData;
                        this.m_friction = a.friction;
                        this.m_restitution = a.restitution;
                        this.m_body = b;
                        this.m_proxyId = b2Pair.b2_nullProxy;
                        this.m_maxRadius = 0;
                        this.m_categoryBits = a.categoryBits;
                        this.m_maskBits = a.maskBits;
                        this.m_groupIndex = a.groupIndex;
                        this.m_localPosition = new b2Vec2;
                        var d = a;
                        this.m_localPosition.Set(a.localPosition.x - c.x, a.localPosition.y - c.y);
                        this.m_type = b2Shape.e_circleShape;
                        this.m_radius = d.radius;
                        this.m_R.SetM(this.m_body.m_R);
                        var e = this.m_R.col1.x * this.m_localPosition.x + this.m_R.col2.x * this.m_localPosition.y;
                        var f = this.m_R.col1.y * this.m_localPosition.x + this.m_R.col2.y * this.m_localPosition.y;
                        this.m_position.x = this.m_body.m_position.x + e;
                        this.m_position.y = this.m_body.m_position.y + f;
                        this.m_maxRadius = Math.sqrt(e * e + f * f) + this.m_radius;
                        var g = new b2AABB;
                        g.minVertex.Set(this.m_position.x - this.m_radius, this.m_position.y - this.m_radius);
                        g.maxVertex.Set(this.m_position.x + this.m_radius, this.m_position.y + this.m_radius);
                        var h = this.m_body.m_world.m_broadPhase;
                        if (h.InRange(g)) {
                            this.m_proxyId = h.CreateProxy(g, this)
                        } else {
                            this.m_proxyId = b2Pair.b2_nullProxy
                        }
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            this.m_body.Freeze()
                        }
                    }, Synchronize: function (a, b, c, d) {
                        this.m_R.SetM(d);
                        this.m_position.x = d.col1.x * this.m_localPosition.x + d.col2.x * this.m_localPosition.y + c.x;
                        this.m_position.y = d.col1.y * this.m_localPosition.x + d.col2.y * this.m_localPosition.y + c.y;
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            return
                        }
                        var e = a.x + (b.col1.x * this.m_localPosition.x + b.col2.x * this.m_localPosition.y);
                        var f = a.y + (b.col1.y * this.m_localPosition.x + b.col2.y * this.m_localPosition.y);
                        var g = Math.min(e, this.m_position.x);
                        var h = Math.min(f, this.m_position.y);
                        var i = Math.max(e, this.m_position.x);
                        var j = Math.max(f, this.m_position.y);
                        var k = new b2AABB;
                        k.minVertex.Set(g - this.m_radius, h - this.m_radius);
                        k.maxVertex.Set(i + this.m_radius, j + this.m_radius);
                        var l = this.m_body.m_world.m_broadPhase;
                        if (l.InRange(k)) {
                            l.MoveProxy(this.m_proxyId, k)
                        } else {
                            this.m_body.Freeze()
                        }
                    }, QuickSync: function (a, b) {
                        this.m_R.SetM(b);
                        this.m_position.x = b.col1.x * this.m_localPosition.x + b.col2.x * this.m_localPosition.y + a.x;
                        this.m_position.y = b.col1.y * this.m_localPosition.x + b.col2.y * this.m_localPosition.y + a.y
                    }, ResetProxy: function (a) {
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            return
                        }
                        var b = a.GetProxy(this.m_proxyId);
                        a.DestroyProxy(this.m_proxyId);
                        b = null;
                        var c = new b2AABB;
                        c.minVertex.Set(this.m_position.x - this.m_radius, this.m_position.y - this.m_radius);
                        c.maxVertex.Set(this.m_position.x + this.m_radius, this.m_position.y + this.m_radius);
                        if (a.InRange(c)) {
                            this.m_proxyId = a.CreateProxy(c, this)
                        } else {
                            this.m_proxyId = b2Pair.b2_nullProxy
                        }
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            this.m_body.Freeze()
                        }
                    }, Support: function (a, b, c) {
                        var d = Math.sqrt(a * a + b * b);
                        a /= d;
                        b /= d;
                        c.Set(this.m_position.x + this.m_radius * a, this.m_position.y + this.m_radius * b)
                    }, m_localPosition: new b2Vec2, m_radius: null
                });
                var b2MassData = Class.create();
                b2MassData.prototype = {
                    mass: 0, center: new b2Vec2(0, 0), I: 0, initialize: function () {
                        this.center = new b2Vec2(0, 0)
                    }
                };
                var b2PolyDef = Class.create();
                Object.extend(b2PolyDef.prototype, b2ShapeDef.prototype);
                Object.extend(b2PolyDef.prototype, {
                    initialize: function () {
                        this.type = b2Shape.e_unknownShape;
                        this.userData = null;
                        this.localPosition = new b2Vec2(0, 0);
                        this.localRotation = 0;
                        this.friction = .2;
                        this.restitution = 0;
                        this.density = 0;
                        this.categoryBits = 1;
                        this.maskBits = 65535;
                        this.groupIndex = 0;
                        this.vertices = new Array(b2Settings.b2_maxPolyVertices);
                        this.type = b2Shape.e_polyShape;
                        this.vertexCount = 0;
                        for (var a = 0; a < b2Settings.b2_maxPolyVertices; a++) {
                            this.vertices[a] = new b2Vec2
                        }
                    }, vertices: new Array(b2Settings.b2_maxPolyVertices), vertexCount: 0
                });
                var b2PolyShape = Class.create();
                Object.extend(b2PolyShape.prototype, b2Shape.prototype);
                Object.extend(b2PolyShape.prototype, {
                    TestPoint: function (a) {
                        var b = new b2Vec2;
                        b.SetV(a);
                        b.Subtract(this.m_position);
                        b.MulTM(this.m_R);
                        for (var c = 0; c < this.m_vertexCount; ++c) {
                            var d = new b2Vec2;
                            d.SetV(b);
                            d.Subtract(this.m_vertices[c]);
                            var e = b2Math.b2Dot(this.m_normals[c], d);
                            if (e > 0) {
                                return false
                            }
                        }
                        return true
                    },
                    initialize: function (a, b, c) {
                        this.m_R = new b2Mat22;
                        this.m_position = new b2Vec2;
                        this.m_userData = a.userData;
                        this.m_friction = a.friction;
                        this.m_restitution = a.restitution;
                        this.m_body = b;
                        this.m_proxyId = b2Pair.b2_nullProxy;
                        this.m_maxRadius = 0;
                        this.m_categoryBits = a.categoryBits;
                        this.m_maskBits = a.maskBits;
                        this.m_groupIndex = a.groupIndex;
                        this.syncAABB = new b2AABB;
                        this.syncMat = new b2Mat22;
                        this.m_localCentroid = new b2Vec2;
                        this.m_localOBB = new b2OBB;
                        var d = 0;
                        var e;
                        var f;
                        var g;
                        var h = new b2AABB;
                        this.m_vertices = new Array(b2Settings.b2_maxPolyVertices);
                        this.m_coreVertices = new Array(b2Settings.b2_maxPolyVertices);
                        this.m_normals = new Array(b2Settings.b2_maxPolyVertices);
                        this.m_type = b2Shape.e_polyShape;
                        var i = new b2Mat22(a.localRotation);
                        if (a.type == b2Shape.e_boxShape) {
                            this.m_localCentroid.x = a.localPosition.x - c.x;
                            this.m_localCentroid.y = a.localPosition.y - c.y;
                            var j = a;
                            this.m_vertexCount = 4;
                            e = j.extents.x;
                            f = j.extents.y;
                            var k = Math.max(0, e - 2 * b2Settings.b2_linearSlop);
                            var l = Math.max(0, f - 2 * b2Settings.b2_linearSlop);
                            g = this.m_vertices[0] = new b2Vec2;
                            g.x = i.col1.x * e + i.col2.x * f;
                            g.y = i.col1.y * e + i.col2.y * f;
                            g = this.m_vertices[1] = new b2Vec2;
                            g.x = i.col1.x * -e + i.col2.x * f;
                            g.y = i.col1.y * -e + i.col2.y * f;
                            g = this.m_vertices[2] = new b2Vec2;
                            g.x = i.col1.x * -e + i.col2.x * -f;
                            g.y = i.col1.y * -e + i.col2.y * -f;
                            g = this.m_vertices[3] = new b2Vec2;
                            g.x = i.col1.x * e + i.col2.x * -f;
                            g.y = i.col1.y * e + i.col2.y * -f;
                            g = this.m_coreVertices[0] = new b2Vec2;
                            g.x = i.col1.x * k + i.col2.x * l;
                            g.y = i.col1.y * k + i.col2.y * l;
                            g = this.m_coreVertices[1] = new b2Vec2;
                            g.x = i.col1.x * -k + i.col2.x * l;
                            g.y = i.col1.y * -k + i.col2.y * l;
                            g = this.m_coreVertices[2] = new b2Vec2;
                            g.x = i.col1.x * -k + i.col2.x * -l;
                            g.y = i.col1.y * -k + i.col2.y * -l;
                            g = this.m_coreVertices[3] = new b2Vec2;
                            g.x = i.col1.x * k + i.col2.x * -l;
                            g.y = i.col1.y * k + i.col2.y * -l
                        } else {
                            var m = a;
                            this.m_vertexCount = m.vertexCount;
                            b2Shape.PolyCentroid(m.vertices, m.vertexCount, b2PolyShape.tempVec);
                            var n = b2PolyShape.tempVec.x;
                            var o = b2PolyShape.tempVec.y;
                            this.m_localCentroid.x = a.localPosition.x + (i.col1.x * n + i.col2.x * o) - c.x;
                            this.m_localCentroid.y = a.localPosition.y + (i.col1.y * n + i.col2.y * o) - c.y;
                            for (d = 0; d < this.m_vertexCount; ++d) {
                                this.m_vertices[d] = new b2Vec2;
                                this.m_coreVertices[d] = new b2Vec2;
                                e = m.vertices[d].x - n;
                                f = m.vertices[d].y - o;
                                this.m_vertices[d].x = i.col1.x * e + i.col2.x * f;
                                this.m_vertices[d].y = i.col1.y * e + i.col2.y * f;
                                var p = this.m_vertices[d].x;
                                var q = this.m_vertices[d].y;
                                var r = Math.sqrt(p * p + q * q);
                                if (r > Number.MIN_VALUE) {
                                    p *= 1 / r;
                                    q *= 1 / r
                                }
                                this.m_coreVertices[d].x = this.m_vertices[d].x - 2 * b2Settings.b2_linearSlop * p;
                                this.m_coreVertices[d].y = this.m_vertices[d].y - 2 * b2Settings.b2_linearSlop * q
                            }
                        }
                        var s = Number.MAX_VALUE;
                        var t = Number.MAX_VALUE;
                        var u = -Number.MAX_VALUE;
                        var v = -Number.MAX_VALUE;
                        this.m_maxRadius = 0;
                        for (d = 0; d < this.m_vertexCount; ++d) {
                            var w = this.m_vertices[d];
                            s = Math.min(s, w.x);
                            t = Math.min(t, w.y);
                            u = Math.max(u, w.x);
                            v = Math.max(v, w.y);
                            this.m_maxRadius = Math.max(this.m_maxRadius, w.Length())
                        }
                        this.m_localOBB.R.SetIdentity();
                        this.m_localOBB.center.Set((s + u) * .5, (t + v) * .5);
                        this.m_localOBB.extents.Set((u - s) * .5, (v - t) * .5);
                        var x = 0;
                        var y = 0;
                        for (d = 0; d < this.m_vertexCount; ++d) {
                            this.m_normals[d] = new b2Vec2;
                            x = d;
                            y = d + 1 < this.m_vertexCount ? d + 1 : 0;
                            this.m_normals[d].x = this.m_vertices[y].y - this.m_vertices[x].y;
                            this.m_normals[d].y = -(this.m_vertices[y].x - this.m_vertices[x].x);
                            this.m_normals[d].Normalize()
                        }
                        for (d = 0; d < this.m_vertexCount; ++d) {
                            x = d;
                            y = d + 1 < this.m_vertexCount ? d + 1 : 0
                        }
                        this.m_R.SetM(this.m_body.m_R);
                        this.m_position.x = this.m_body.m_position.x + (this.m_R.col1.x * this.m_localCentroid.x + this.m_R.col2.x * this.m_localCentroid.y);
                        this.m_position.y = this.m_body.m_position.y + (this.m_R.col1.y * this.m_localCentroid.x + this.m_R.col2.y * this.m_localCentroid.y);
                        b2PolyShape.tAbsR.col1.x = this.m_R.col1.x * this.m_localOBB.R.col1.x + this.m_R.col2.x * this.m_localOBB.R.col1.y;
                        b2PolyShape.tAbsR.col1.y = this.m_R.col1.y * this.m_localOBB.R.col1.x + this.m_R.col2.y * this.m_localOBB.R.col1.y;
                        b2PolyShape.tAbsR.col2.x = this.m_R.col1.x * this.m_localOBB.R.col2.x + this.m_R.col2.x * this.m_localOBB.R.col2.y;
                        b2PolyShape.tAbsR.col2.y = this.m_R.col1.y * this.m_localOBB.R.col2.x + this.m_R.col2.y * this.m_localOBB.R.col2.y;
                        b2PolyShape.tAbsR.Abs();
                        e = b2PolyShape.tAbsR.col1.x * this.m_localOBB.extents.x + b2PolyShape.tAbsR.col2.x * this.m_localOBB.extents.y;
                        f = b2PolyShape.tAbsR.col1.y * this.m_localOBB.extents.x + b2PolyShape.tAbsR.col2.y * this.m_localOBB.extents.y;
                        var z = this.m_position.x + (this.m_R.col1.x * this.m_localOBB.center.x + this.m_R.col2.x * this.m_localOBB.center.y);
                        var A = this.m_position.y + (this.m_R.col1.y * this.m_localOBB.center.x + this.m_R.col2.y * this.m_localOBB.center.y);
                        h.minVertex.x = z - e;
                        h.minVertex.y = A - f;
                        h.maxVertex.x = z + e;
                        h.maxVertex.y = A + f;
                        var B = this.m_body.m_world.m_broadPhase;
                        if (B.InRange(h)) {
                            this.m_proxyId = B.CreateProxy(h, this)
                        } else {
                            this.m_proxyId = b2Pair.b2_nullProxy
                        }
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            this.m_body.Freeze()
                        }
                    },
                    syncAABB: new b2AABB,
                    syncMat: new b2Mat22,
                    Synchronize: function (a, b, c, d) {
                        this.m_R.SetM(d);
                        this.m_position.x = this.m_body.m_position.x + (d.col1.x * this.m_localCentroid.x + d.col2.x * this.m_localCentroid.y);
                        this.m_position.y = this.m_body.m_position.y + (d.col1.y * this.m_localCentroid.x + d.col2.y * this.m_localCentroid.y);
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            return
                        }
                        var e;
                        var f;
                        var g = b.col1;
                        var h = b.col2;
                        var i = this.m_localOBB.R.col1;
                        var j = this.m_localOBB.R.col2;
                        this.syncMat.col1.x = g.x * i.x + h.x * i.y;
                        this.syncMat.col1.y = g.y * i.x + h.y * i.y;
                        this.syncMat.col2.x = g.x * j.x + h.x * j.y;
                        this.syncMat.col2.y = g.y * j.x + h.y * j.y;
                        this.syncMat.Abs();
                        e = this.m_localCentroid.x + this.m_localOBB.center.x;
                        f = this.m_localCentroid.y + this.m_localOBB.center.y;
                        var k = a.x + (b.col1.x * e + b.col2.x * f);
                        var l = a.y + (b.col1.y * e + b.col2.y * f);
                        e = this.syncMat.col1.x * this.m_localOBB.extents.x + this.syncMat.col2.x * this.m_localOBB.extents.y;
                        f = this.syncMat.col1.y * this.m_localOBB.extents.x + this.syncMat.col2.y * this.m_localOBB.extents.y;
                        this.syncAABB.minVertex.x = k - e;
                        this.syncAABB.minVertex.y = l - f;
                        this.syncAABB.maxVertex.x = k + e;
                        this.syncAABB.maxVertex.y = l + f;
                        g = d.col1;
                        h = d.col2;
                        i = this.m_localOBB.R.col1;
                        j = this.m_localOBB.R.col2;
                        this.syncMat.col1.x = g.x * i.x + h.x * i.y;
                        this.syncMat.col1.y = g.y * i.x + h.y * i.y;
                        this.syncMat.col2.x = g.x * j.x + h.x * j.y;
                        this.syncMat.col2.y = g.y * j.x + h.y * j.y;
                        this.syncMat.Abs();
                        e = this.m_localCentroid.x + this.m_localOBB.center.x;
                        f = this.m_localCentroid.y + this.m_localOBB.center.y;
                        k = c.x + (d.col1.x * e + d.col2.x * f);
                        l = c.y + (d.col1.y * e + d.col2.y * f);
                        e = this.syncMat.col1.x * this.m_localOBB.extents.x + this.syncMat.col2.x * this.m_localOBB.extents.y;
                        f = this.syncMat.col1.y * this.m_localOBB.extents.x + this.syncMat.col2.y * this.m_localOBB.extents.y;
                        this.syncAABB.minVertex.x = Math.min(this.syncAABB.minVertex.x, k - e);
                        this.syncAABB.minVertex.y = Math.min(this.syncAABB.minVertex.y, l - f);
                        this.syncAABB.maxVertex.x = Math.max(this.syncAABB.maxVertex.x, k + e);
                        this.syncAABB.maxVertex.y = Math.max(this.syncAABB.maxVertex.y, l + f);
                        var m = this.m_body.m_world.m_broadPhase;
                        if (m.InRange(this.syncAABB)) {
                            m.MoveProxy(this.m_proxyId, this.syncAABB)
                        } else {
                            this.m_body.Freeze()
                        }
                    },
                    QuickSync: function (a, b) {
                        this.m_R.SetM(b);
                        this.m_position.x = a.x + (b.col1.x * this.m_localCentroid.x + b.col2.x * this.m_localCentroid.y);
                        this.m_position.y = a.y + (b.col1.y * this.m_localCentroid.x + b.col2.y * this.m_localCentroid.y)
                    },
                    ResetProxy: function (a) {
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            return
                        }
                        var b = a.GetProxy(this.m_proxyId);
                        a.DestroyProxy(this.m_proxyId);
                        b = null;
                        var c = b2Math.b2MulMM(this.m_R, this.m_localOBB.R);
                        var d = b2Math.b2AbsM(c);
                        var e = b2Math.b2MulMV(d, this.m_localOBB.extents);
                        var f = b2Math.b2MulMV(this.m_R, this.m_localOBB.center);
                        f.Add(this.m_position);
                        var g = new b2AABB;
                        g.minVertex.SetV(f);
                        g.minVertex.Subtract(e);
                        g.maxVertex.SetV(f);
                        g.maxVertex.Add(e);
                        if (a.InRange(g)) {
                            this.m_proxyId = a.CreateProxy(g, this)
                        } else {
                            this.m_proxyId = b2Pair.b2_nullProxy
                        }
                        if (this.m_proxyId == b2Pair.b2_nullProxy) {
                            this.m_body.Freeze()
                        }
                    },
                    Support: function (a, b, c) {
                        var d = a * this.m_R.col1.x + b * this.m_R.col1.y;
                        var e = a * this.m_R.col2.x + b * this.m_R.col2.y;
                        var f = 0;
                        var g = this.m_coreVertices[0].x * d + this.m_coreVertices[0].y * e;
                        for (var h = 1; h < this.m_vertexCount; ++h) {
                            var i = this.m_coreVertices[h].x * d + this.m_coreVertices[h].y * e;
                            if (i > g) {
                                f = h;
                                g = i
                            }
                        }
                        c.Set(this.m_position.x + (this.m_R.col1.x * this.m_coreVertices[f].x + this.m_R.col2.x * this.m_coreVertices[f].y), this.m_position.y + (this.m_R.col1.y * this.m_coreVertices[f].x + this.m_R.col2.y * this.m_coreVertices[f].y))
                    },
                    m_localCentroid: new b2Vec2,
                    m_localOBB: new b2OBB,
                    m_vertices: null,
                    m_coreVertices: null,
                    m_vertexCount: 0,
                    m_normals: null
                });
                b2PolyShape.tempVec = new b2Vec2;
                b2PolyShape.tAbsR = new b2Mat22;
                var b2Body = Class.create();
                b2Body.prototype = {
                    SetOriginPosition: function (a, b) {
                        if (this.IsFrozen()) {
                            return
                        }
                        this.m_rotation = b;
                        this.m_R.Set(this.m_rotation);
                        this.m_position = b2Math.AddVV(a, b2Math.b2MulMV(this.m_R, this.m_center));
                        this.m_position0.SetV(this.m_position);
                        this.m_rotation0 = this.m_rotation;
                        for (var c = this.m_shapeList; c != null; c = c.m_next) {
                            c.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R)
                        }
                        this.m_world.m_broadPhase.Commit()
                    },
                    GetOriginPosition: function () {
                        return b2Math.SubtractVV(this.m_position, b2Math.b2MulMV(this.m_R, this.m_center))
                    },
                    SetCenterPosition: function (a, b) {
                        if (this.IsFrozen()) {
                            return
                        }
                        this.m_rotation = b;
                        this.m_R.Set(this.m_rotation);
                        this.m_position.SetV(a);
                        this.m_position0.SetV(this.m_position);
                        this.m_rotation0 = this.m_rotation;
                        for (var c = this.m_shapeList; c != null; c = c.m_next) {
                            c.Synchronize(this.m_position, this.m_R, this.m_position, this.m_R)
                        }
                        this.m_world.m_broadPhase.Commit()
                    },
                    GetCenterPosition: function () {
                        return this.m_position
                    },
                    GetRotation: function () {
                        return this.m_rotation
                    },
                    GetRotationMatrix: function () {
                        return this.m_R
                    },
                    SetLinearVelocity: function (a) {
                        this.m_linearVelocity.SetV(a)
                    },
                    GetLinearVelocity: function () {
                        return this.m_linearVelocity
                    },
                    SetAngularVelocity: function (a) {
                        this.m_angularVelocity = a
                    },
                    GetAngularVelocity: function () {
                        return this.m_angularVelocity
                    },
                    ApplyForce: function (a, b) {
                        if (this.IsSleeping() == false) {
                            this.m_force.Add(a);
                            this.m_torque += b2Math.b2CrossVV(b2Math.SubtractVV(b, this.m_position), a)
                        }
                    },
                    ApplyTorque: function (a) {
                        if (this.IsSleeping() == false) {
                            this.m_torque += a
                        }
                    },
                    ApplyImpulse: function (a, b) {
                        if (this.IsSleeping() == false) {
                            this.m_linearVelocity.Add(b2Math.MulFV(this.m_invMass, a));
                            this.m_angularVelocity += this.m_invI * b2Math.b2CrossVV(b2Math.SubtractVV(b, this.m_position), a)
                        }
                    },
                    GetMass: function () {
                        return this.m_mass
                    },
                    GetInertia: function () {
                        return this.m_I
                    },
                    GetWorldPoint: function (a) {
                        return b2Math.AddVV(this.m_position, b2Math.b2MulMV(this.m_R, a))
                    },
                    GetWorldVector: function (a) {
                        return b2Math.b2MulMV(this.m_R, a)
                    },
                    GetLocalPoint: function (a) {
                        return b2Math.b2MulTMV(this.m_R, b2Math.SubtractVV(a, this.m_position))
                    },
                    GetLocalVector: function (a) {
                        return b2Math.b2MulTMV(this.m_R, a)
                    },
                    IsStatic: function () {
                        return (this.m_flags & b2Body.e_staticFlag) == b2Body.e_staticFlag
                    },
                    IsFrozen: function () {
                        return (this.m_flags & b2Body.e_frozenFlag) == b2Body.e_frozenFlag
                    },
                    IsSleeping: function () {
                        return (this.m_flags & b2Body.e_sleepFlag) == b2Body.e_sleepFlag
                    },
                    AllowSleeping: function (a) {
                        if (a) {
                            this.m_flags |= b2Body.e_allowSleepFlag
                        } else {
                            this.m_flags &= ~b2Body.e_allowSleepFlag;
                            this.WakeUp()
                        }
                    },
                    WakeUp: function () {
                        this.m_flags &= ~b2Body.e_sleepFlag;
                        this.m_sleepTime = 0
                    },
                    GetShapeList: function () {
                        return this.m_shapeList
                    },
                    GetContactList: function () {
                        return this.m_contactList
                    },
                    GetJointList: function () {
                        return this.m_jointList
                    },
                    GetNext: function () {
                        return this.m_next
                    },
                    GetUserData: function () {
                        return this.m_userData
                    },
                    initialize: function (a, b) {
                        this.sMat0 = new b2Mat22;
                        this.m_position = new b2Vec2;
                        this.m_R = new b2Mat22(0);
                        this.m_position0 = new b2Vec2;
                        var c = 0;
                        var d;
                        var e;
                        this.m_flags = 0;
                        this.m_position.SetV(a.position);
                        this.m_rotation = a.rotation;
                        this.m_R.Set(this.m_rotation);
                        this.m_position0.SetV(this.m_position);
                        this.m_rotation0 = this.m_rotation;
                        this.m_world = b;
                        this.m_linearDamping = b2Math.b2Clamp(1 - a.linearDamping, 0, 1);
                        this.m_angularDamping = b2Math.b2Clamp(1 - a.angularDamping, 0, 1);
                        this.m_force = new b2Vec2(0, 0);
                        this.m_torque = 0;
                        this.m_mass = 0;
                        var f = new Array(b2Settings.b2_maxShapesPerBody);
                        for (c = 0; c < b2Settings.b2_maxShapesPerBody; c++) {
                            f[c] = new b2MassData
                        }
                        this.m_shapeCount = 0;
                        this.m_center = new b2Vec2(0, 0);
                        for (c = 0; c < b2Settings.b2_maxShapesPerBody; ++c) {
                            d = a.shapes[c];
                            if (d == null)break;
                            e = f[c];
                            d.ComputeMass(e);
                            this.m_mass += e.mass;
                            this.m_center.x += e.mass * (d.localPosition.x + e.center.x);
                            this.m_center.y += e.mass * (d.localPosition.y + e.center.y);
                            ++this.m_shapeCount
                        }
                        if (this.m_mass > 0) {
                            this.m_center.Multiply(1 / this.m_mass);
                            this.m_position.Add(b2Math.b2MulMV(this.m_R, this.m_center))
                        } else {
                            this.m_flags |= b2Body.e_staticFlag
                        }
                        this.m_I = 0;
                        for (c = 0; c < this.m_shapeCount; ++c) {
                            d = a.shapes[c];
                            e = f[c];
                            this.m_I += e.I;
                            var g = b2Math.SubtractVV(b2Math.AddVV(d.localPosition, e.center), this.m_center);
                            this.m_I += e.mass * b2Math.b2Dot(g, g)
                        }
                        if (this.m_mass > 0) {
                            this.m_invMass = 1 / this.m_mass
                        } else {
                            this.m_invMass = 0
                        }
                        if (this.m_I > 0 && a.preventRotation == false) {
                            this.m_invI = 1 / this.m_I
                        } else {
                            this.m_I = 0;
                            this.m_invI = 0
                        }
                        this.m_linearVelocity = b2Math.AddVV(a.linearVelocity, b2Math.b2CrossFV(a.angularVelocity, this.m_center));
                        this.m_angularVelocity = a.angularVelocity;
                        this.m_jointList = null;
                        this.m_contactList = null;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_shapeList = null;
                        for (c = 0; c < this.m_shapeCount; ++c) {
                            d = a.shapes[c];
                            var h = b2Shape.Create(d, this, this.m_center);
                            h.m_next = this.m_shapeList;
                            this.m_shapeList = h
                        }
                        this.m_sleepTime = 0;
                        if (a.allowSleep) {
                            this.m_flags |= b2Body.e_allowSleepFlag
                        }
                        if (a.isSleeping) {
                            this.m_flags |= b2Body.e_sleepFlag
                        }
                        if (this.m_flags & b2Body.e_sleepFlag || this.m_invMass == 0) {
                            this.m_linearVelocity.Set(0, 0);
                            this.m_angularVelocity = 0
                        }
                        this.m_userData = a.userData
                    },
                    Destroy: function () {
                        var a = this.m_shapeList;
                        while (a) {
                            var b = a;
                            a = a.m_next;
                            b2Shape.Destroy(b)
                        }
                    },
                    sMat0: new b2Mat22,
                    SynchronizeShapes: function () {
                        this.sMat0.Set(this.m_rotation0);
                        for (var a = this.m_shapeList; a != null; a = a.m_next) {
                            a.Synchronize(this.m_position0, this.sMat0, this.m_position, this.m_R)
                        }
                    },
                    QuickSyncShapes: function () {
                        for (var a = this.m_shapeList; a != null; a = a.m_next) {
                            a.QuickSync(this.m_position, this.m_R)
                        }
                    },
                    IsConnected: function (a) {
                        for (var b = this.m_jointList; b != null; b = b.next) {
                            if (b.other == a)return b.joint.m_collideConnected == false
                        }
                        return false
                    },
                    Freeze: function () {
                        this.m_flags |= b2Body.e_frozenFlag;
                        this.m_linearVelocity.SetZero();
                        this.m_angularVelocity = 0;
                        for (var a = this.m_shapeList; a != null; a = a.m_next) {
                            a.DestroyProxy()
                        }
                    },
                    m_flags: 0,
                    m_position: new b2Vec2,
                    m_rotation: null,
                    m_R: new b2Mat22(0),
                    m_position0: new b2Vec2,
                    m_rotation0: null,
                    m_linearVelocity: null,
                    m_angularVelocity: null,
                    m_force: null,
                    m_torque: null,
                    m_center: null,
                    m_world: null,
                    m_prev: null,
                    m_next: null,
                    m_shapeList: null,
                    m_shapeCount: 0,
                    m_jointList: null,
                    m_contactList: null,
                    m_mass: null,
                    m_invMass: null,
                    m_I: null,
                    m_invI: null,
                    m_linearDamping: null,
                    m_angularDamping: null,
                    m_sleepTime: null,
                    m_userData: null
                };
                b2Body.e_staticFlag = 1;
                b2Body.e_frozenFlag = 2;
                b2Body.e_islandFlag = 4;
                b2Body.e_sleepFlag = 8;
                b2Body.e_allowSleepFlag = 16;
                b2Body.e_destroyFlag = 32;
                var b2BodyDef = Class.create();
                b2BodyDef.prototype = {
                    initialize: function () {
                        this.shapes = new Array;
                        this.userData = null;
                        for (var a = 0; a < b2Settings.b2_maxShapesPerBody; a++) {
                            this.shapes[a] = null
                        }
                        this.position = new b2Vec2(0, 0);
                        this.rotation = 0;
                        this.linearVelocity = new b2Vec2(0, 0);
                        this.angularVelocity = 0;
                        this.linearDamping = 0;
                        this.angularDamping = 0;
                        this.allowSleep = true;
                        this.isSleeping = false;
                        this.preventRotation = false
                    },
                    userData: null,
                    shapes: new Array,
                    position: null,
                    rotation: null,
                    linearVelocity: null,
                    angularVelocity: null,
                    linearDamping: null,
                    angularDamping: null,
                    allowSleep: null,
                    isSleeping: null,
                    preventRotation: null,
                    AddShape: function (a) {
                        for (var b = 0; b < b2Settings.b2_maxShapesPerBody; ++b) {
                            if (this.shapes[b] == null) {
                                this.shapes[b] = a;
                                break
                            }
                        }
                    }
                };
                var b2CollisionFilter = Class.create();
                b2CollisionFilter.prototype = {
                    ShouldCollide: function (a, b) {
                        if (a.m_groupIndex == b.m_groupIndex && a.m_groupIndex != 0) {
                            return a.m_groupIndex > 0
                        }
                        var c = (a.m_maskBits & b.m_categoryBits) != 0 && (a.m_categoryBits & b.m_maskBits) != 0;
                        return c
                    }, initialize: function () {
                    }
                };
                b2CollisionFilter.b2_defaultFilter = new b2CollisionFilter;
                var b2Island = Class.create();
                b2Island.prototype = {
                    initialize: function (a, b, c, d) {
                        var e = 0;
                        this.m_bodyCapacity = a;
                        this.m_contactCapacity = b;
                        this.m_jointCapacity = c;
                        this.m_bodyCount = 0;
                        this.m_contactCount = 0;
                        this.m_jointCount = 0;
                        this.m_bodies = new Array(a);
                        for (e = 0; e < a; e++)this.m_bodies[e] = null;
                        this.m_contacts = new Array(b);
                        for (e = 0; e < b; e++)this.m_contacts[e] = null;
                        this.m_joints = new Array(c);
                        for (e = 0; e < c; e++)this.m_joints[e] = null;
                        this.m_allocator = d
                    },
                    Clear: function () {
                        this.m_bodyCount = 0;
                        this.m_contactCount = 0;
                        this.m_jointCount = 0
                    },
                    Solve: function (a, b) {
                        var c = 0;
                        var d;
                        for (c = 0; c < this.m_bodyCount; ++c) {
                            d = this.m_bodies[c];
                            if (d.m_invMass == 0)continue;
                            d.m_linearVelocity.Add(b2Math.MulFV(a.dt, b2Math.AddVV(b, b2Math.MulFV(d.m_invMass, d.m_force))));
                            d.m_angularVelocity += a.dt * d.m_invI * d.m_torque;
                            d.m_linearVelocity.Multiply(d.m_linearDamping);
                            d.m_angularVelocity *= d.m_angularDamping;
                            d.m_position0.SetV(d.m_position);
                            d.m_rotation0 = d.m_rotation
                        }
                        var e = new b2ContactSolver(this.m_contacts, this.m_contactCount, this.m_allocator);
                        e.PreSolve();
                        for (c = 0; c < this.m_jointCount; ++c) {
                            this.m_joints[c].PrepareVelocitySolver()
                        }
                        for (c = 0; c < a.iterations; ++c) {
                            e.SolveVelocityConstraints();
                            for (var f = 0; f < this.m_jointCount; ++f) {
                                this.m_joints[f].SolveVelocityConstraints(a)
                            }
                        }
                        for (c = 0; c < this.m_bodyCount; ++c) {
                            d = this.m_bodies[c];
                            if (d.m_invMass == 0)continue;
                            d.m_position.x += a.dt * d.m_linearVelocity.x;
                            d.m_position.y += a.dt * d.m_linearVelocity.y;
                            d.m_rotation += a.dt * d.m_angularVelocity;
                            d.m_R.Set(d.m_rotation)
                        }
                        for (c = 0; c < this.m_jointCount; ++c) {
                            this.m_joints[c].PreparePositionSolver()
                        }
                        if (b2World.s_enablePositionCorrection) {
                            for (b2Island.m_positionIterationCount = 0; b2Island.m_positionIterationCount < a.iterations; ++b2Island.m_positionIterationCount) {
                                var g = e.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
                                var h = true;
                                for (c = 0; c < this.m_jointCount; ++c) {
                                    var i = this.m_joints[c].SolvePositionConstraints();
                                    h = h && i
                                }
                                if (g && h) {
                                    break
                                }
                            }
                        }
                        e.PostSolve();
                        for (c = 0; c < this.m_bodyCount; ++c) {
                            d = this.m_bodies[c];
                            if (d.m_invMass == 0)continue;
                            d.m_R.Set(d.m_rotation);
                            d.SynchronizeShapes();
                            d.m_force.Set(0, 0);
                            d.m_torque = 0
                        }
                    },
                    UpdateSleep: function (a) {
                        var b = 0;
                        var c;
                        var d = Number.MAX_VALUE;
                        var e = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
                        var f = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;
                        for (b = 0; b < this.m_bodyCount; ++b) {
                            c = this.m_bodies[b];
                            if (c.m_invMass == 0) {
                                continue
                            }
                            if ((c.m_flags & b2Body.e_allowSleepFlag) == 0) {
                                c.m_sleepTime = 0;
                                d = 0
                            }
                            if ((c.m_flags & b2Body.e_allowSleepFlag) == 0 || c.m_angularVelocity * c.m_angularVelocity > f || b2Math.b2Dot(c.m_linearVelocity, c.m_linearVelocity) > e) {
                                c.m_sleepTime = 0;
                                d = 0
                            } else {
                                c.m_sleepTime += a;
                                d = b2Math.b2Min(d, c.m_sleepTime)
                            }
                        }
                        if (d >= b2Settings.b2_timeToSleep) {
                            for (b = 0; b < this.m_bodyCount; ++b) {
                                c = this.m_bodies[b];
                                c.m_flags |= b2Body.e_sleepFlag
                            }
                        }
                    },
                    AddBody: function (a) {
                        this.m_bodies[this.m_bodyCount++] = a
                    },
                    AddContact: function (a) {
                        this.m_contacts[this.m_contactCount++] = a
                    },
                    AddJoint: function (a) {
                        this.m_joints[this.m_jointCount++] = a
                    },
                    m_allocator: null,
                    m_bodies: null,
                    m_contacts: null,
                    m_joints: null,
                    m_bodyCount: 0,
                    m_jointCount: 0,
                    m_contactCount: 0,
                    m_bodyCapacity: 0,
                    m_contactCapacity: 0,
                    m_jointCapacity: 0,
                    m_positionError: null
                };
                b2Island.m_positionIterationCount = 0;
                var b2TimeStep = Class.create();
                b2TimeStep.prototype = {
                    dt: null, inv_dt: null, iterations: 0, initialize: function () {
                    }
                };
                var b2ContactNode = Class.create();
                b2ContactNode.prototype = {
                    other: null, contact: null, prev: null, next: null, initialize: function () {
                    }
                };
                var b2Contact = Class.create();
                b2Contact.prototype = {
                    GetManifolds: function () {
                        return null
                    },
                    GetManifoldCount: function () {
                        return this.m_manifoldCount
                    },
                    GetNext: function () {
                        return this.m_next
                    },
                    GetShape1: function () {
                        return this.m_shape1
                    },
                    GetShape2: function () {
                        return this.m_shape2
                    },
                    initialize: function (a, b) {
                        this.m_node1 = new b2ContactNode;
                        this.m_node2 = new b2ContactNode;
                        this.m_flags = 0;
                        if (!a || !b) {
                            this.m_shape1 = null;
                            this.m_shape2 = null;
                            return
                        }
                        this.m_shape1 = a;
                        this.m_shape2 = b;
                        this.m_manifoldCount = 0;
                        this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
                        this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_node1.contact = null;
                        this.m_node1.prev = null;
                        this.m_node1.next = null;
                        this.m_node1.other = null;
                        this.m_node2.contact = null;
                        this.m_node2.prev = null;
                        this.m_node2.next = null;
                        this.m_node2.other = null
                    },
                    Evaluate: function () {
                    },
                    m_flags: 0,
                    m_prev: null,
                    m_next: null,
                    m_node1: new b2ContactNode,
                    m_node2: new b2ContactNode,
                    m_shape1: null,
                    m_shape2: null,
                    m_manifoldCount: 0,
                    m_friction: null,
                    m_restitution: null
                };
                b2Contact.e_islandFlag = 1;
                b2Contact.e_destroyFlag = 2;
                b2Contact.AddType = function (a, b, c, d) {
                    b2Contact.s_registers[c][d].createFcn = a;
                    b2Contact.s_registers[c][d].destroyFcn = b;
                    b2Contact.s_registers[c][d].primary = true;
                    if (c != d) {
                        b2Contact.s_registers[d][c].createFcn = a;
                        b2Contact.s_registers[d][c].destroyFcn = b;
                        b2Contact.s_registers[d][c].primary = false
                    }
                };
                b2Contact.InitializeRegisters = function () {
                    b2Contact.s_registers = new Array(b2Shape.e_shapeTypeCount);
                    for (var a = 0; a < b2Shape.e_shapeTypeCount; a++) {
                        b2Contact.s_registers[a] = new Array(b2Shape.e_shapeTypeCount);
                        for (var b = 0; b < b2Shape.e_shapeTypeCount; b++) {
                            b2Contact.s_registers[a][b] = new b2ContactRegister
                        }
                    }
                    b2Contact.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
                    b2Contact.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polyShape, b2Shape.e_circleShape);
                    b2Contact.AddType(b2PolyContact.Create, b2PolyContact.Destroy, b2Shape.e_polyShape, b2Shape.e_polyShape)
                };
                b2Contact.Create = function (a, b, c) {
                    if (b2Contact.s_initialized == false) {
                        b2Contact.InitializeRegisters();
                        b2Contact.s_initialized = true
                    }
                    var d = a.m_type;
                    var e = b.m_type;
                    var f = b2Contact.s_registers[d][e].createFcn;
                    if (f) {
                        if (b2Contact.s_registers[d][e].primary) {
                            return f(a, b, c)
                        } else {
                            var g = f(b, a, c);
                            for (var h = 0; h < g.GetManifoldCount(); ++h) {
                                var i = g.GetManifolds()[h];
                                i.normal = i.normal.Negative()
                            }
                            return g
                        }
                    } else {
                        return null
                    }
                };
                b2Contact.Destroy = function (a, b) {
                    if (a.GetManifoldCount() > 0) {
                        a.m_shape1.m_body.WakeUp();
                        a.m_shape2.m_body.WakeUp()
                    }
                    var c = a.m_shape1.m_type;
                    var d = a.m_shape2.m_type;
                    var e = b2Contact.s_registers[c][d].destroyFcn;
                    e(a, b)
                };
                b2Contact.s_registers = null;
                b2Contact.s_initialized = false;
                var b2ContactConstraint = Class.create();
                b2ContactConstraint.prototype = {
                    initialize: function () {
                        this.normal = new b2Vec2;
                        this.points = new Array(b2Settings.b2_maxManifoldPoints);
                        for (var a = 0; a < b2Settings.b2_maxManifoldPoints; a++) {
                            this.points[a] = new b2ContactConstraintPoint
                        }
                    },
                    points: null,
                    normal: new b2Vec2,
                    manifold: null,
                    body1: null,
                    body2: null,
                    friction: null,
                    restitution: null,
                    pointCount: 0
                };
                var b2ContactConstraintPoint = Class.create();
                b2ContactConstraintPoint.prototype = {
                    localAnchor1: new b2Vec2,
                    localAnchor2: new b2Vec2,
                    normalImpulse: null,
                    tangentImpulse: null,
                    positionImpulse: null,
                    normalMass: null,
                    tangentMass: null,
                    separation: null,
                    velocityBias: null,
                    initialize: function () {
                        this.localAnchor1 = new b2Vec2;
                        this.localAnchor2 = new b2Vec2
                    }
                };
                var b2ContactRegister = Class.create();
                b2ContactRegister.prototype = {
                    createFcn: null,
                    destroyFcn: null,
                    primary: null,
                    initialize: function () {
                    }
                };
                var b2ContactSolver = Class.create();
                b2ContactSolver.prototype = {
                    initialize: function (a, b, c) {
                        this.m_constraints = new Array;
                        this.m_allocator = c;
                        var d = 0;
                        var e;
                        var f;
                        this.m_constraintCount = 0;
                        for (d = 0; d < b; ++d) {
                            this.m_constraintCount += a[d].GetManifoldCount()
                        }
                        for (d = 0; d < this.m_constraintCount; d++) {
                            this.m_constraints[d] = new b2ContactConstraint
                        }
                        var g = 0;
                        for (d = 0; d < b; ++d) {
                            var h = a[d];
                            var i = h.m_shape1.m_body;
                            var j = h.m_shape2.m_body;
                            var k = h.GetManifoldCount();
                            var l = h.GetManifolds();
                            var m = h.m_friction;
                            var n = h.m_restitution;
                            var o = i.m_linearVelocity.x;
                            var p = i.m_linearVelocity.y;
                            var q = j.m_linearVelocity.x;
                            var r = j.m_linearVelocity.y;
                            var s = i.m_angularVelocity;
                            var t = j.m_angularVelocity;
                            for (var u = 0; u < k; ++u) {
                                var v = l[u];
                                var w = v.normal.x;
                                var x = v.normal.y;
                                var y = this.m_constraints[g];
                                y.body1 = i;
                                y.body2 = j;
                                y.manifold = v;
                                y.normal.x = w;
                                y.normal.y = x;
                                y.pointCount = v.pointCount;
                                y.friction = m;
                                y.restitution = n;
                                for (var z = 0; z < y.pointCount; ++z) {
                                    var A = v.points[z];
                                    var B = y.points[z];
                                    B.normalImpulse = A.normalImpulse;
                                    B.tangentImpulse = A.tangentImpulse;
                                    B.separation = A.separation;
                                    var C = A.position.x - i.m_position.x;
                                    var D = A.position.y - i.m_position.y;
                                    var E = A.position.x - j.m_position.x;
                                    var F = A.position.y - j.m_position.y;
                                    e = B.localAnchor1;
                                    f = i.m_R;
                                    e.x = C * f.col1.x + D * f.col1.y;
                                    e.y = C * f.col2.x + D * f.col2.y;
                                    e = B.localAnchor2;
                                    f = j.m_R;
                                    e.x = E * f.col1.x + F * f.col1.y;
                                    e.y = E * f.col2.x + F * f.col2.y;
                                    var G = C * C + D * D;
                                    var H = E * E + F * F;
                                    var I = C * w + D * x;
                                    var J = E * w + F * x;
                                    var K = i.m_invMass + j.m_invMass;
                                    K += i.m_invI * (G - I * I) + j.m_invI * (H - J * J);
                                    B.normalMass = 1 / K;
                                    var L = x;
                                    var M = -w;
                                    var N = C * L + D * M;
                                    var O = E * L + F * M;
                                    var P = i.m_invMass + j.m_invMass;
                                    P += i.m_invI * (G - N * N) + j.m_invI * (H - O * O);
                                    B.tangentMass = 1 / P;
                                    B.velocityBias = 0;
                                    if (B.separation > 0) {
                                        B.velocityBias = -60 * B.separation
                                    }
                                    var Q = q + -t * F - o - -s * D;
                                    var R = r + t * E - p - s * C;
                                    var S = y.normal.x * Q + y.normal.y * R;
                                    if (S < -b2Settings.b2_velocityThreshold) {
                                        B.velocityBias += -y.restitution * S
                                    }
                                }
                                ++g
                            }
                        }
                    }, PreSolve: function () {
                        var a;
                        var b;
                        var c;
                        for (var d = 0; d < this.m_constraintCount; ++d) {
                            var e = this.m_constraints[d];
                            var f = e.body1;
                            var g = e.body2;
                            var h = f.m_invMass;
                            var i = f.m_invI;
                            var j = g.m_invMass;
                            var k = g.m_invI;
                            var l = e.normal.x;
                            var m = e.normal.y;
                            var n = m;
                            var o = -l;
                            var p = 0;
                            var q = 0;
                            if (b2World.s_enableWarmStarting) {
                                q = e.pointCount;
                                for (p = 0; p < q; ++p) {
                                    var r = e.points[p];
                                    var s = r.normalImpulse * l + r.tangentImpulse * n;
                                    var t = r.normalImpulse * m + r.tangentImpulse * o;
                                    c = f.m_R;
                                    a = r.localAnchor1;
                                    var u = c.col1.x * a.x + c.col2.x * a.y;
                                    var v = c.col1.y * a.x + c.col2.y * a.y;
                                    c = g.m_R;
                                    a = r.localAnchor2;
                                    var w = c.col1.x * a.x + c.col2.x * a.y;
                                    var x = c.col1.y * a.x + c.col2.y * a.y;
                                    f.m_angularVelocity -= i * (u * t - v * s);
                                    f.m_linearVelocity.x -= h * s;
                                    f.m_linearVelocity.y -= h * t;
                                    g.m_angularVelocity += k * (w * t - x * s);
                                    g.m_linearVelocity.x += j * s;
                                    g.m_linearVelocity.y += j * t;
                                    r.positionImpulse = 0
                                }
                            } else {
                                q = e.pointCount;
                                for (p = 0; p < q; ++p) {
                                    var y = e.points[p];
                                    y.normalImpulse = 0;
                                    y.tangentImpulse = 0;
                                    y.positionImpulse = 0
                                }
                            }
                        }
                    }, SolveVelocityConstraints: function () {
                        var a = 0;
                        var b;
                        var c;
                        var d;
                        var e;
                        var f;
                        var g;
                        var h;
                        var i;
                        var j;
                        var k;
                        var l;
                        var m;
                        var n;
                        for (var o = 0; o < this.m_constraintCount; ++o) {
                            var p = this.m_constraints[o];
                            var q = p.body1;
                            var r = p.body2;
                            var s = q.m_angularVelocity;
                            var t = q.m_linearVelocity;
                            var u = r.m_angularVelocity;
                            var v = r.m_linearVelocity;
                            var w = q.m_invMass;
                            var x = q.m_invI;
                            var y = r.m_invMass;
                            var z = r.m_invI;
                            var A = p.normal.x;
                            var B = p.normal.y;
                            var C = B;
                            var D = -A;
                            var E = p.pointCount;
                            for (a = 0; a < E; ++a) {
                                b = p.points[a];
                                m = q.m_R;
                                n = b.localAnchor1;
                                c = m.col1.x * n.x + m.col2.x * n.y;
                                d = m.col1.y * n.x + m.col2.y * n.y;
                                m = r.m_R;
                                n = b.localAnchor2;
                                e = m.col1.x * n.x + m.col2.x * n.y;
                                f = m.col1.y * n.x + m.col2.y * n.y;
                                g = v.x + -u * f - t.x - -s * d;
                                h = v.y + u * e - t.y - s * c;
                                var F = g * A + h * B;
                                i = -b.normalMass * (F - b.velocityBias);
                                j = b2Math.b2Max(b.normalImpulse + i, 0);
                                i = j - b.normalImpulse;
                                k = i * A;
                                l = i * B;
                                t.x -= w * k;
                                t.y -= w * l;
                                s -= x * (c * l - d * k);
                                v.x += y * k;
                                v.y += y * l;
                                u += z * (e * l - f * k);
                                b.normalImpulse = j;
                                g = v.x + -u * f - t.x - -s * d;
                                h = v.y + u * e - t.y - s * c;
                                var G = g * C + h * D;
                                i = b.tangentMass * -G;
                                var H = p.friction * b.normalImpulse;
                                j = b2Math.b2Clamp(b.tangentImpulse + i, -H, H);
                                i = j - b.tangentImpulse;
                                k = i * C;
                                l = i * D;
                                t.x -= w * k;
                                t.y -= w * l;
                                s -= x * (c * l - d * k);
                                v.x += y * k;
                                v.y += y * l;
                                u += z * (e * l - f * k);
                                b.tangentImpulse = j
                            }
                            q.m_angularVelocity = s;
                            r.m_angularVelocity = u
                        }
                    }, SolvePositionConstraints: function (a) {
                        var b = 0;
                        var c;
                        var d;
                        for (var e = 0; e < this.m_constraintCount; ++e) {
                            var f = this.m_constraints[e];
                            var g = f.body1;
                            var h = f.body2;
                            var i = g.m_position;
                            var j = g.m_rotation;
                            var k = h.m_position;
                            var l = h.m_rotation;
                            var m = g.m_invMass;
                            var n = g.m_invI;
                            var o = h.m_invMass;
                            var p = h.m_invI;
                            var q = f.normal.x;
                            var r = f.normal.y;
                            var s = r;
                            var t = -q;
                            var u = f.pointCount;
                            for (var v = 0; v < u; ++v) {
                                var w = f.points[v];
                                c = g.m_R;
                                d = w.localAnchor1;
                                var x = c.col1.x * d.x + c.col2.x * d.y;
                                var y = c.col1.y * d.x + c.col2.y * d.y;
                                c = h.m_R;
                                d = w.localAnchor2;
                                var z = c.col1.x * d.x + c.col2.x * d.y;
                                var A = c.col1.y * d.x + c.col2.y * d.y;
                                var B = i.x + x;
                                var C = i.y + y;
                                var D = k.x + z;
                                var E = k.y + A;
                                var F = D - B;
                                var G = E - C;
                                var H = F * q + G * r + w.separation;
                                b = b2Math.b2Min(b, H);
                                var I = a * b2Math.b2Clamp(H + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
                                var J = -w.normalMass * I;
                                var K = w.positionImpulse;
                                w.positionImpulse = b2Math.b2Max(K + J, 0);
                                J = w.positionImpulse - K;
                                var L = J * q;
                                var M = J * r;
                                i.x -= m * L;
                                i.y -= m * M;
                                j -= n * (x * M - y * L);
                                g.m_R.Set(j);
                                k.x += o * L;
                                k.y += o * M;
                                l += p * (z * M - A * L);
                                h.m_R.Set(l)
                            }
                            g.m_rotation = j;
                            h.m_rotation = l
                        }
                        return b >= -b2Settings.b2_linearSlop
                    }, PostSolve: function () {
                        for (var a = 0; a < this.m_constraintCount; ++a) {
                            var b = this.m_constraints[a];
                            var c = b.manifold;
                            for (var d = 0; d < b.pointCount; ++d) {
                                var e = c.points[d];
                                var f = b.points[d];
                                e.normalImpulse = f.normalImpulse;
                                e.tangentImpulse = f.tangentImpulse
                            }
                        }
                    }, m_allocator: null, m_constraints: new Array, m_constraintCount: 0
                };
                var b2CircleContact = Class.create();
                Object.extend(b2CircleContact.prototype, b2Contact.prototype);
                Object.extend(b2CircleContact.prototype, {
                    initialize: function (a, b) {
                        this.m_node1 = new b2ContactNode;
                        this.m_node2 = new b2ContactNode;
                        this.m_flags = 0;
                        if (!a || !b) {
                            this.m_shape1 = null;
                            this.m_shape2 = null;
                            return
                        }
                        this.m_shape1 = a;
                        this.m_shape2 = b;
                        this.m_manifoldCount = 0;
                        this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
                        this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_node1.contact = null;
                        this.m_node1.prev = null;
                        this.m_node1.next = null;
                        this.m_node1.other = null;
                        this.m_node2.contact = null;
                        this.m_node2.prev = null;
                        this.m_node2.next = null;
                        this.m_node2.other = null;
                        this.m_manifold = [new b2Manifold];
                        this.m_manifold[0].pointCount = 0;
                        this.m_manifold[0].points[0].normalImpulse = 0;
                        this.m_manifold[0].points[0].tangentImpulse = 0
                    }, Evaluate: function () {
                        b2Collision.b2CollideCircle(this.m_manifold[0], this.m_shape1, this.m_shape2, false);
                        if (this.m_manifold[0].pointCount > 0) {
                            this.m_manifoldCount = 1
                        } else {
                            this.m_manifoldCount = 0
                        }
                    }, GetManifolds: function () {
                        return this.m_manifold
                    }, m_manifold: [new b2Manifold]
                });
                b2CircleContact.Create = function (a, b, c) {
                    return new b2CircleContact(a, b)
                };
                b2CircleContact.Destroy = function (a, b) {
                };
                var b2Conservative = Class.create();
                b2Conservative.prototype = {
                    initialize: function () {
                    }
                };
                b2Conservative.R1 = new b2Mat22;
                b2Conservative.R2 = new b2Mat22;
                b2Conservative.x1 = new b2Vec2;
                b2Conservative.x2 = new b2Vec2;
                b2Conservative.Conservative = function (a, b) {
                    var c = a.GetBody();
                    var e = b.GetBody();
                    var f = c.m_position.x - c.m_position0.x;
                    var g = c.m_position.y - c.m_position0.y;
                    var h = c.m_rotation - c.m_rotation0;
                    var i = e.m_position.x - e.m_position0.x;
                    var j = e.m_position.y - e.m_position0.y;
                    var k = e.m_rotation - e.m_rotation0;
                    var l = a.GetMaxRadius();
                    var m = b.GetMaxRadius();
                    var n = c.m_position0.x;
                    var o = c.m_position0.y;
                    var p = c.m_rotation0;
                    var q = e.m_position0.x;
                    var r = e.m_position0.y;
                    var s = e.m_rotation0;
                    var t = n;
                    var u = o;
                    var v = p;
                    var w = q;
                    var x = r;
                    var y = s;
                    b2Conservative.R1.Set(v);
                    b2Conservative.R2.Set(y);
                    a.QuickSync(p1, b2Conservative.R1);
                    b.QuickSync(p2, b2Conservative.R2);
                    var z = 0;
                    var A = 10;
                    var B;
                    var C;
                    var D = 0;
                    var E = true;
                    for (var F = 0; F < A; ++F) {
                        var G = b2Distance.Distance(b2Conservative.x1, b2Conservative.x2, a, b);
                        if (G < b2Settings.b2_linearSlop) {
                            if (F == 0) {
                                E = false
                            } else {
                                E = true
                            }
                            break
                        }
                        if (F == 0) {
                            B = b2Conservative.x2.x - b2Conservative.x1.x;
                            C = b2Conservative.x2.y - b2Conservative.x1.y;
                            var H = Math.sqrt(B * B + C * C);
                            var I = B * (f - i) + C * (g - j) + Math.abs(h) * l + Math.abs(k) * m;
                            if (Math.abs(I) < Number.MIN_VALUE) {
                                E = false;
                                break
                            }
                            D = 1 / I
                        }
                        var J = G * D;
                        var K = z + J;
                        if (K < 0 || 1 < K) {
                            E = false;
                            break
                        }
                        if (K < (1 + 100 * Number.MIN_VALUE) * z) {
                            E = true;
                            break
                        }
                        z = K;
                        t = n + z * v1.x;
                        u = o + z * v1.y;
                        v = p + z * h;
                        w = q + z * v2.x;
                        x = r + z * v2.y;
                        y = s + z * k;
                        b2Conservative.R1.Set(v);
                        b2Conservative.R2.Set(y);
                        a.QuickSync(p1, b2Conservative.R1);
                        b.QuickSync(p2, b2Conservative.R2)
                    }
                    if (E) {
                        B = b2Conservative.x2.x - b2Conservative.x1.x;
                        C = b2Conservative.x2.y - b2Conservative.x1.y;
                        var L = Math.sqrt(B * B + C * C);
                        if (L > FLT_EPSILON) {
                            d *= b2_linearSlop / L
                        }
                        if (c.IsStatic()) {
                            c.m_position.x = t;
                            c.m_position.y = u
                        } else {
                            c.m_position.x = t - B;
                            c.m_position.y = u - C
                        }
                        c.m_rotation = v;
                        c.m_R.Set(v);
                        c.QuickSyncShapes();
                        if (e.IsStatic()) {
                            e.m_position.x = w;
                            e.m_position.y = x
                        } else {
                            e.m_position.x = w + B;
                            e.m_position.y = x + C
                        }
                        e.m_position.x = w + B;
                        e.m_position.y = x + C;
                        e.m_rotation = y;
                        e.m_R.Set(y);
                        e.QuickSyncShapes();
                        return true
                    }
                    a.QuickSync(c.m_position, c.m_R);
                    b.QuickSync(e.m_position, e.m_R);
                    return false
                };
                var b2NullContact = Class.create();
                Object.extend(b2NullContact.prototype, b2Contact.prototype);
                Object.extend(b2NullContact.prototype, {
                    initialize: function (a, b) {
                        this.m_node1 = new b2ContactNode;
                        this.m_node2 = new b2ContactNode;
                        this.m_flags = 0;
                        if (!a || !b) {
                            this.m_shape1 = null;
                            this.m_shape2 = null;
                            return
                        }
                        this.m_shape1 = a;
                        this.m_shape2 = b;
                        this.m_manifoldCount = 0;
                        this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
                        this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_node1.contact = null;
                        this.m_node1.prev = null;
                        this.m_node1.next = null;
                        this.m_node1.other = null;
                        this.m_node2.contact = null;
                        this.m_node2.prev = null;
                        this.m_node2.next = null;
                        this.m_node2.other = null
                    }, Evaluate: function () {
                    }, GetManifolds: function () {
                        return null
                    }
                });
                var b2PolyAndCircleContact = Class.create();
                Object.extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
                Object.extend(b2PolyAndCircleContact.prototype, {
                    initialize: function (a, b) {
                        this.m_node1 = new b2ContactNode;
                        this.m_node2 = new b2ContactNode;
                        this.m_flags = 0;
                        if (!a || !b) {
                            this.m_shape1 = null;
                            this.m_shape2 = null;
                            return
                        }
                        this.m_shape1 = a;
                        this.m_shape2 = b;
                        this.m_manifoldCount = 0;
                        this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
                        this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_node1.contact = null;
                        this.m_node1.prev = null;
                        this.m_node1.next = null;
                        this.m_node1.other = null;
                        this.m_node2.contact = null;
                        this.m_node2.prev = null;
                        this.m_node2.next = null;
                        this.m_node2.other = null;
                        this.m_manifold = [new b2Manifold];
                        b2Settings.b2Assert(this.m_shape1.m_type == b2Shape.e_polyShape);
                        b2Settings.b2Assert(this.m_shape2.m_type == b2Shape.e_circleShape);
                        this.m_manifold[0].pointCount = 0;
                        this.m_manifold[0].points[0].normalImpulse = 0;
                        this.m_manifold[0].points[0].tangentImpulse = 0
                    }, Evaluate: function () {
                        b2Collision.b2CollidePolyAndCircle(this.m_manifold[0], this.m_shape1, this.m_shape2, false);
                        if (this.m_manifold[0].pointCount > 0) {
                            this.m_manifoldCount = 1
                        } else {
                            this.m_manifoldCount = 0
                        }
                    }, GetManifolds: function () {
                        return this.m_manifold
                    }, m_manifold: [new b2Manifold]
                });
                b2PolyAndCircleContact.Create = function (a, b, c) {
                    return new b2PolyAndCircleContact(a, b)
                };
                b2PolyAndCircleContact.Destroy = function (a, b) {
                };
                var b2PolyContact = Class.create();
                Object.extend(b2PolyContact.prototype, b2Contact.prototype);
                Object.extend(b2PolyContact.prototype, {
                    initialize: function (a, b) {
                        this.m_node1 = new b2ContactNode;
                        this.m_node2 = new b2ContactNode;
                        this.m_flags = 0;
                        if (!a || !b) {
                            this.m_shape1 = null;
                            this.m_shape2 = null;
                            return
                        }
                        this.m_shape1 = a;
                        this.m_shape2 = b;
                        this.m_manifoldCount = 0;
                        this.m_friction = Math.sqrt(this.m_shape1.m_friction * this.m_shape2.m_friction);
                        this.m_restitution = b2Math.b2Max(this.m_shape1.m_restitution, this.m_shape2.m_restitution);
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_node1.contact = null;
                        this.m_node1.prev = null;
                        this.m_node1.next = null;
                        this.m_node1.other = null;
                        this.m_node2.contact = null;
                        this.m_node2.prev = null;
                        this.m_node2.next = null;
                        this.m_node2.other = null;
                        this.m0 = new b2Manifold;
                        this.m_manifold = [new b2Manifold];
                        this.m_manifold[0].pointCount = 0
                    }, m0: new b2Manifold, Evaluate: function () {
                        var a = this.m_manifold[0];
                        var b = this.m0.points;
                        for (var c = 0; c < a.pointCount; c++) {
                            var d = b[c];
                            var e = a.points[c];
                            d.normalImpulse = e.normalImpulse;
                            d.tangentImpulse = e.tangentImpulse;
                            d.id = e.id.Copy()
                        }
                        this.m0.pointCount = a.pointCount;
                        b2Collision.b2CollidePoly(a, this.m_shape1, this.m_shape2, false);
                        if (a.pointCount > 0) {
                            var f = [false, false];
                            for (var g = 0; g < a.pointCount; ++g) {
                                var h = a.points[g];
                                h.normalImpulse = 0;
                                h.tangentImpulse = 0;
                                var i = h.id.key;
                                for (var j = 0; j < this.m0.pointCount; ++j) {
                                    if (f[j] == true)continue;
                                    var k = this.m0.points[j];
                                    var l = k.id;
                                    if (l.key == i) {
                                        f[j] = true;
                                        h.normalImpulse = k.normalImpulse;
                                        h.tangentImpulse = k.tangentImpulse;
                                        break
                                    }
                                }
                            }
                            this.m_manifoldCount = 1
                        } else {
                            this.m_manifoldCount = 0
                        }
                    }, GetManifolds: function () {
                        return this.m_manifold
                    }, m_manifold: [new b2Manifold]
                });
                b2PolyContact.Create = function (a, b, c) {
                    return new b2PolyContact(a, b)
                };
                b2PolyContact.Destroy = function (a, b) {
                };
                var b2ContactManager = Class.create();
                Object.extend(b2ContactManager.prototype, b2PairCallback.prototype);
                Object.extend(b2ContactManager.prototype, {
                    initialize: function () {
                        this.m_nullContact = new b2NullContact;
                        this.m_world = null;
                        this.m_destroyImmediate = false
                    }, PairAdded: function (a, b) {
                        var c = a;
                        var d = b;
                        var e = c.m_body;
                        var f = d.m_body;
                        if (e.IsStatic() && f.IsStatic()) {
                            return this.m_nullContact
                        }
                        if (c.m_body == d.m_body) {
                            return this.m_nullContact
                        }
                        if (f.IsConnected(e)) {
                            return this.m_nullContact
                        }
                        if (this.m_world.m_filter != null && this.m_world.m_filter.ShouldCollide(c, d) == false) {
                            return this.m_nullContact
                        }
                        if (f.m_invMass == 0) {
                            var g = c;
                            c = d;
                            d = g;
                            var h = e;
                            e = f;
                            f = h
                        }
                        var i = b2Contact.Create(c, d, this.m_world.m_blockAllocator);
                        if (i == null) {
                            return this.m_nullContact
                        } else {
                            i.m_prev = null;
                            i.m_next = this.m_world.m_contactList;
                            if (this.m_world.m_contactList != null) {
                                this.m_world.m_contactList.m_prev = i
                            }
                            this.m_world.m_contactList = i;
                            this.m_world.m_contactCount++
                        }
                        return i
                    }, PairRemoved: function (a, b, c) {
                        if (c == null) {
                            return
                        }
                        var d = c;
                        if (d != this.m_nullContact) {
                            if (this.m_destroyImmediate == true) {
                                this.DestroyContact(d);
                                d = null
                            } else {
                                d.m_flags |= b2Contact.e_destroyFlag
                            }
                        }
                    }, DestroyContact: function (a) {
                        if (a.m_prev) {
                            a.m_prev.m_next = a.m_next
                        }
                        if (a.m_next) {
                            a.m_next.m_prev = a.m_prev
                        }
                        if (a == this.m_world.m_contactList) {
                            this.m_world.m_contactList = a.m_next
                        }
                        if (a.GetManifoldCount() > 0) {
                            var b = a.m_shape1.m_body;
                            var c = a.m_shape2.m_body;
                            var d = a.m_node1;
                            var e = a.m_node2;
                            b.WakeUp();
                            c.WakeUp();
                            if (d.prev) {
                                d.prev.next = d.next
                            }
                            if (d.next) {
                                d.next.prev = d.prev
                            }
                            if (d == b.m_contactList) {
                                b.m_contactList = d.next
                            }
                            d.prev = null;
                            d.next = null;
                            if (e.prev) {
                                e.prev.next = e.next
                            }
                            if (e.next) {
                                e.next.prev = e.prev
                            }
                            if (e == c.m_contactList) {
                                c.m_contactList = e.next
                            }
                            e.prev = null;
                            e.next = null
                        }
                        b2Contact.Destroy(a, this.m_world.m_blockAllocator);
                        --this.m_world.m_contactCount
                    }, CleanContactList: function () {
                        var a = this.m_world.m_contactList;
                        while (a != null) {
                            var b = a;
                            a = a.m_next;
                            if (b.m_flags & b2Contact.e_destroyFlag) {
                                this.DestroyContact(b);
                                b = null
                            }
                        }
                    }, Collide: function () {
                        var a;
                        var b;
                        var c;
                        var d;
                        for (var e = this.m_world.m_contactList; e != null; e = e.m_next) {
                            if (e.m_shape1.m_body.IsSleeping() && e.m_shape2.m_body.IsSleeping()) {
                                continue
                            }
                            var f = e.GetManifoldCount();
                            e.Evaluate();
                            var g = e.GetManifoldCount();
                            if (f == 0 && g > 0) {
                                a = e.m_shape1.m_body;
                                b = e.m_shape2.m_body;
                                c = e.m_node1;
                                d = e.m_node2;
                                c.contact = e;
                                c.other = b;
                                c.prev = null;
                                c.next = a.m_contactList;
                                if (c.next != null) {
                                    c.next.prev = e.m_node1
                                }
                                a.m_contactList = e.m_node1;
                                d.contact = e;
                                d.other = a;
                                d.prev = null;
                                d.next = b.m_contactList;
                                if (d.next != null) {
                                    d.next.prev = d
                                }
                                b.m_contactList = d
                            } else if (f > 0 && g == 0) {
                                a = e.m_shape1.m_body;
                                b = e.m_shape2.m_body;
                                c = e.m_node1;
                                d = e.m_node2;
                                if (c.prev) {
                                    c.prev.next = c.next
                                }
                                if (c.next) {
                                    c.next.prev = c.prev
                                }
                                if (c == a.m_contactList) {
                                    a.m_contactList = c.next
                                }
                                c.prev = null;
                                c.next = null;
                                if (d.prev) {
                                    d.prev.next = d.next
                                }
                                if (d.next) {
                                    d.next.prev = d.prev
                                }
                                if (d == b.m_contactList) {
                                    b.m_contactList = d.next
                                }
                                d.prev = null;
                                d.next = null
                            }
                        }
                    }, m_world: null, m_nullContact: new b2NullContact, m_destroyImmediate: null
                });
                var b2World = Class.create();
                b2World.prototype = {
                    initialize: function (a, b, c) {
                        this.step = new b2TimeStep;
                        this.m_contactManager = new b2ContactManager;
                        this.m_listener = null;
                        this.m_filter = b2CollisionFilter.b2_defaultFilter;
                        this.m_bodyList = null;
                        this.m_contactList = null;
                        this.m_jointList = null;
                        this.m_bodyCount = 0;
                        this.m_contactCount = 0;
                        this.m_jointCount = 0;
                        this.m_bodyDestroyList = null;
                        this.m_allowSleep = c;
                        this.m_gravity = b;
                        this.m_contactManager.m_world = this;
                        this.m_broadPhase = new b2BroadPhase(a, this.m_contactManager);
                        var d = new b2BodyDef;
                        this.m_groundBody = this.CreateBody(d)
                    },
                    SetListener: function (a) {
                        this.m_listener = a
                    },
                    SetFilter: function (a) {
                        this.m_filter = a
                    },
                    CreateBody: function (a) {
                        var b = new b2Body(a, this);
                        b.m_prev = null;
                        b.m_next = this.m_bodyList;
                        if (this.m_bodyList) {
                            this.m_bodyList.m_prev = b
                        }
                        this.m_bodyList = b;
                        ++this.m_bodyCount;
                        return b
                    },
                    DestroyBody: function (a) {
                        if (a.m_flags & b2Body.e_destroyFlag) {
                            return
                        }
                        if (a.m_prev) {
                            a.m_prev.m_next = a.m_next
                        }
                        if (a.m_next) {
                            a.m_next.m_prev = a.m_prev
                        }
                        if (a == this.m_bodyList) {
                            this.m_bodyList = a.m_next
                        }
                        a.m_flags |= b2Body.e_destroyFlag;
                        --this.m_bodyCount;
                        a.m_prev = null;
                        a.m_next = this.m_bodyDestroyList;
                        this.m_bodyDestroyList = a
                    },
                    CleanBodyList: function () {
                        this.m_contactManager.m_destroyImmediate = true;
                        var a = this.m_bodyDestroyList;
                        while (a) {
                            var b = a;
                            a = a.m_next;
                            var c = b.m_jointList;
                            while (c) {
                                var d = c;
                                c = c.next;
                                if (this.m_listener) {
                                    this.m_listener.NotifyJointDestroyed(d.joint)
                                }
                                this.DestroyJoint(d.joint)
                            }
                            b.Destroy()
                        }
                        this.m_bodyDestroyList = null;
                        this.m_contactManager.m_destroyImmediate = false
                    },
                    CreateJoint: function (a) {
                        var b = b2Joint.Create(a, this.m_blockAllocator);
                        b.m_prev = null;
                        b.m_next = this.m_jointList;
                        if (this.m_jointList) {
                            this.m_jointList.m_prev = b
                        }
                        this.m_jointList = b;
                        ++this.m_jointCount;
                        b.m_node1.joint = b;
                        b.m_node1.other = b.m_body2;
                        b.m_node1.prev = null;
                        b.m_node1.next = b.m_body1.m_jointList;
                        if (b.m_body1.m_jointList)b.m_body1.m_jointList.prev = b.m_node1;
                        b.m_body1.m_jointList = b.m_node1;
                        b.m_node2.joint = b;
                        b.m_node2.other = b.m_body1;
                        b.m_node2.prev = null;
                        b.m_node2.next = b.m_body2.m_jointList;
                        if (b.m_body2.m_jointList)b.m_body2.m_jointList.prev = b.m_node2;
                        b.m_body2.m_jointList = b.m_node2;
                        if (a.collideConnected == false) {
                            var c = a.body1.m_shapeCount < a.body2.m_shapeCount ? a.body1 : a.body2;
                            for (var d = c.m_shapeList; d; d = d.m_next) {
                                d.ResetProxy(this.m_broadPhase)
                            }
                        }
                        return b
                    },
                    DestroyJoint: function (a) {
                        var b = a.m_collideConnected;
                        if (a.m_prev) {
                            a.m_prev.m_next = a.m_next
                        }
                        if (a.m_next) {
                            a.m_next.m_prev = a.m_prev
                        }
                        if (a == this.m_jointList) {
                            this.m_jointList = a.m_next
                        }
                        var c = a.m_body1;
                        var d = a.m_body2;
                        c.WakeUp();
                        d.WakeUp();
                        if (a.m_node1.prev) {
                            a.m_node1.prev.next = a.m_node1.next
                        }
                        if (a.m_node1.next) {
                            a.m_node1.next.prev = a.m_node1.prev
                        }
                        if (a.m_node1 == c.m_jointList) {
                            c.m_jointList = a.m_node1.next
                        }
                        a.m_node1.prev = null;
                        a.m_node1.next = null;
                        if (a.m_node2.prev) {
                            a.m_node2.prev.next = a.m_node2.next
                        }
                        if (a.m_node2.next) {
                            a.m_node2.next.prev = a.m_node2.prev
                        }
                        if (a.m_node2 == d.m_jointList) {
                            d.m_jointList = a.m_node2.next
                        }
                        a.m_node2.prev = null;
                        a.m_node2.next = null;
                        b2Joint.Destroy(a, this.m_blockAllocator);
                        --this.m_jointCount;
                        if (b == false) {
                            var e = c.m_shapeCount < d.m_shapeCount ? c : d;
                            for (var f = e.m_shapeList; f; f = f.m_next) {
                                f.ResetProxy(this.m_broadPhase)
                            }
                        }
                    },
                    GetGroundBody: function () {
                        return this.m_groundBody
                    },
                    step: new b2TimeStep,
                    Step: function (a, b) {
                        var c;
                        var d;
                        this.step.dt = a;
                        this.step.iterations = b;
                        if (a > 0) {
                            this.step.inv_dt = 1 / a
                        } else {
                            this.step.inv_dt = 0
                        }
                        this.m_positionIterationCount = 0;
                        this.m_contactManager.CleanContactList();
                        this.CleanBodyList();
                        this.m_contactManager.Collide();
                        var e = new b2Island(this.m_bodyCount, this.m_contactCount, this.m_jointCount, this.m_stackAllocator);
                        for (c = this.m_bodyList; c != null; c = c.m_next) {
                            c.m_flags &= ~b2Body.e_islandFlag
                        }
                        for (var f = this.m_contactList; f != null; f = f.m_next) {
                            f.m_flags &= ~b2Contact.e_islandFlag
                        }
                        for (var g = this.m_jointList; g != null; g = g.m_next) {
                            g.m_islandFlag = false
                        }
                        var h = this.m_bodyCount;
                        var i = new Array(this.m_bodyCount);
                        for (var j = 0; j < this.m_bodyCount; j++)i[j] = null;
                        for (var k = this.m_bodyList; k != null; k = k.m_next) {
                            if (k.m_flags & (b2Body.e_staticFlag | b2Body.e_islandFlag | b2Body.e_sleepFlag | b2Body.e_frozenFlag)) {
                                continue
                            }
                            e.Clear();
                            var l = 0;
                            i[l++] = k;
                            k.m_flags |= b2Body.e_islandFlag;
                            while (l > 0) {
                                c = i[--l];
                                e.AddBody(c);
                                c.m_flags &= ~b2Body.e_sleepFlag;
                                if (c.m_flags & b2Body.e_staticFlag) {
                                    continue
                                }
                                for (var m = c.m_contactList; m != null; m = m.next) {
                                    if (m.contact.m_flags & b2Contact.e_islandFlag) {
                                        continue
                                    }
                                    e.AddContact(m.contact);
                                    m.contact.m_flags |= b2Contact.e_islandFlag;
                                    d = m.other;
                                    if (d.m_flags & b2Body.e_islandFlag) {
                                        continue
                                    }
                                    i[l++] = d;
                                    d.m_flags |= b2Body.e_islandFlag
                                }
                                for (var n = c.m_jointList; n != null; n = n.next) {
                                    if (n.joint.m_islandFlag == true) {
                                        continue
                                    }
                                    e.AddJoint(n.joint);
                                    n.joint.m_islandFlag = true;
                                    d = n.other;
                                    if (d.m_flags & b2Body.e_islandFlag) {
                                        continue
                                    }
                                    i[l++] = d;
                                    d.m_flags |= b2Body.e_islandFlag
                                }
                            }
                            e.Solve(this.step, this.m_gravity);
                            this.m_positionIterationCount = b2Math.b2Max(this.m_positionIterationCount, b2Island.m_positionIterationCount);
                            if (this.m_allowSleep) {
                                e.UpdateSleep(a)
                            }
                            for (var o = 0; o < e.m_bodyCount; ++o) {
                                c = e.m_bodies[o];
                                if (c.m_flags & b2Body.e_staticFlag) {
                                    c.m_flags &= ~b2Body.e_islandFlag
                                }
                                if (c.IsFrozen() && this.m_listener) {
                                    var p = this.m_listener.NotifyBoundaryViolated(c);
                                    if (p == b2WorldListener.b2_destroyBody) {
                                        this.DestroyBody(c);
                                        c = null;
                                        e.m_bodies[o] = null
                                    }
                                }
                            }
                        }
                        this.m_broadPhase.Commit()
                    },
                    Query: function (a, b, c) {
                        var d = new Array;
                        var e = this.m_broadPhase.QueryAABB(a, d, c);
                        for (var f = 0; f < e; ++f) {
                            b[f] = d[f]
                        }
                        return e
                    },
                    GetBodyList: function () {
                        return this.m_bodyList
                    },
                    GetJointList: function () {
                        return this.m_jointList
                    },
                    GetContactList: function () {
                        return this.m_contactList
                    },
                    m_blockAllocator: null,
                    m_stackAllocator: null,
                    m_broadPhase: null,
                    m_contactManager: new b2ContactManager,
                    m_bodyList: null,
                    m_contactList: null,
                    m_jointList: null,
                    m_bodyCount: 0,
                    m_contactCount: 0,
                    m_jointCount: 0,
                    m_bodyDestroyList: null,
                    m_gravity: null,
                    m_allowSleep: null,
                    m_groundBody: null,
                    m_listener: null,
                    m_filter: null,
                    m_positionIterationCount: 0
                };
                b2World.s_enablePositionCorrection = 1;
                b2World.s_enableWarmStarting = 1;
                var b2WorldListener = Class.create();
                b2WorldListener.prototype = {
                    NotifyJointDestroyed: function (a) {
                    }, NotifyBoundaryViolated: function (a) {
                        return b2WorldListener.b2_freezeBody
                    }, initialize: function () {
                    }
                };
                b2WorldListener.b2_freezeBody = 0;
                b2WorldListener.b2_destroyBody = 1;
                var b2JointNode = Class.create();
                b2JointNode.prototype = {
                    other: null, joint: null, prev: null, next: null, initialize: function () {
                    }
                };
                var b2Joint = Class.create();
                b2Joint.prototype = {
                    GetType: function () {
                        return this.m_type
                    },
                    GetAnchor1: function () {
                        return null
                    },
                    GetAnchor2: function () {
                        return null
                    },
                    GetReactionForce: function (a) {
                        return null
                    },
                    GetReactionTorque: function (a) {
                        return 0
                    },
                    GetBody1: function () {
                        return this.m_body1
                    },
                    GetBody2: function () {
                        return this.m_body2
                    },
                    GetNext: function () {
                        return this.m_next
                    },
                    GetUserData: function () {
                        return this.m_userData
                    },
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData
                    },
                    PrepareVelocitySolver: function () {
                    },
                    SolveVelocityConstraints: function (a) {
                    },
                    PreparePositionSolver: function () {
                    },
                    SolvePositionConstraints: function () {
                        return false
                    },
                    m_type: 0,
                    m_prev: null,
                    m_next: null,
                    m_node1: new b2JointNode,
                    m_node2: new b2JointNode,
                    m_body1: null,
                    m_body2: null,
                    m_islandFlag: null,
                    m_collideConnected: null,
                    m_userData: null
                };
                b2Joint.Create = function (a, b) {
                    var c = null;
                    switch (a.type) {
                        case b2Joint.e_distanceJoint: {
                            c = new b2DistanceJoint(a)
                        }
                            break;
                        case b2Joint.e_mouseJoint: {
                            c = new b2MouseJoint(a)
                        }
                            break;
                        case b2Joint.e_prismaticJoint: {
                            c = new b2PrismaticJoint(a)
                        }
                            break;
                        case b2Joint.e_revoluteJoint: {
                            c = new b2RevoluteJoint(a)
                        }
                            break;
                        case b2Joint.e_pulleyJoint: {
                            c = new b2PulleyJoint(a)
                        }
                            break;
                        case b2Joint.e_gearJoint: {
                            c = new b2GearJoint(a)
                        }
                            break;
                        default:
                            break
                    }
                    return c
                };
                b2Joint.Destroy = function (a, b) {
                };
                b2Joint.e_unknownJoint = 0;
                b2Joint.e_revoluteJoint = 1;
                b2Joint.e_prismaticJoint = 2;
                b2Joint.e_distanceJoint = 3;
                b2Joint.e_pulleyJoint = 4;
                b2Joint.e_mouseJoint = 5;
                b2Joint.e_gearJoint = 6;
                b2Joint.e_inactiveLimit = 0;
                b2Joint.e_atLowerLimit = 1;
                b2Joint.e_atUpperLimit = 2;
                b2Joint.e_equalLimits = 3;
                var b2JointDef = Class.create();
                b2JointDef.prototype = {
                    initialize: function () {
                        this.type = b2Joint.e_unknownJoint;
                        this.userData = null;
                        this.body1 = null;
                        this.body2 = null;
                        this.collideConnected = false
                    }, type: 0, userData: null, body1: null, body2: null, collideConnected: null
                };
                var b2DistanceJoint = Class.create();
                Object.extend(b2DistanceJoint.prototype, b2Joint.prototype);
                Object.extend(b2DistanceJoint.prototype, {
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData;
                        this.m_localAnchor1 = new b2Vec2;
                        this.m_localAnchor2 = new b2Vec2;
                        this.m_u = new b2Vec2;
                        var b;
                        var c;
                        var d;
                        b = this.m_body1.m_R;
                        c = a.anchorPoint1.x - this.m_body1.m_position.x;
                        d = a.anchorPoint1.y - this.m_body1.m_position.y;
                        this.m_localAnchor1.x = c * b.col1.x + d * b.col1.y;
                        this.m_localAnchor1.y = c * b.col2.x + d * b.col2.y;
                        b = this.m_body2.m_R;
                        c = a.anchorPoint2.x - this.m_body2.m_position.x;
                        d = a.anchorPoint2.y - this.m_body2.m_position.y;
                        this.m_localAnchor2.x = c * b.col1.x + d * b.col1.y;
                        this.m_localAnchor2.y = c * b.col2.x + d * b.col2.y;
                        c = a.anchorPoint2.x - a.anchorPoint1.x;
                        d = a.anchorPoint2.y - a.anchorPoint1.y;
                        this.m_length = Math.sqrt(c * c + d * d);
                        this.m_impulse = 0
                    },
                    PrepareVelocitySolver: function () {
                        var a;
                        a = this.m_body1.m_R;
                        var b = a.col1.x * this.m_localAnchor1.x + a.col2.x * this.m_localAnchor1.y;
                        var c = a.col1.y * this.m_localAnchor1.x + a.col2.y * this.m_localAnchor1.y;
                        a = this.m_body2.m_R;
                        var d = a.col1.x * this.m_localAnchor2.x + a.col2.x * this.m_localAnchor2.y;
                        var e = a.col1.y * this.m_localAnchor2.x + a.col2.y * this.m_localAnchor2.y;
                        this.m_u.x = this.m_body2.m_position.x + d - this.m_body1.m_position.x - b;
                        this.m_u.y = this.m_body2.m_position.y + e - this.m_body1.m_position.y - c;
                        var f = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
                        if (f > b2Settings.b2_linearSlop) {
                            this.m_u.Multiply(1 / f)
                        } else {
                            this.m_u.SetZero()
                        }
                        var g = b * this.m_u.y - c * this.m_u.x;
                        var h = d * this.m_u.y - e * this.m_u.x;
                        this.m_mass = this.m_body1.m_invMass + this.m_body1.m_invI * g * g + this.m_body2.m_invMass + this.m_body2.m_invI * h * h;
                        this.m_mass = 1 / this.m_mass;
                        if (b2World.s_enableWarmStarting) {
                            var i = this.m_impulse * this.m_u.x;
                            var j = this.m_impulse * this.m_u.y;
                            this.m_body1.m_linearVelocity.x -= this.m_body1.m_invMass * i;
                            this.m_body1.m_linearVelocity.y -= this.m_body1.m_invMass * j;
                            this.m_body1.m_angularVelocity -= this.m_body1.m_invI * (b * j - c * i);
                            this.m_body2.m_linearVelocity.x += this.m_body2.m_invMass * i;
                            this.m_body2.m_linearVelocity.y += this.m_body2.m_invMass * j;
                            this.m_body2.m_angularVelocity += this.m_body2.m_invI * (d * j - e * i)
                        } else {
                            this.m_impulse = 0
                        }
                    },
                    SolveVelocityConstraints: function (a) {
                        var b;
                        b = this.m_body1.m_R;
                        var c = b.col1.x * this.m_localAnchor1.x + b.col2.x * this.m_localAnchor1.y;
                        var d = b.col1.y * this.m_localAnchor1.x + b.col2.y * this.m_localAnchor1.y;
                        b = this.m_body2.m_R;
                        var e = b.col1.x * this.m_localAnchor2.x + b.col2.x * this.m_localAnchor2.y;
                        var f = b.col1.y * this.m_localAnchor2.x + b.col2.y * this.m_localAnchor2.y;
                        var g = this.m_body1.m_linearVelocity.x + -this.m_body1.m_angularVelocity * d;
                        var h = this.m_body1.m_linearVelocity.y + this.m_body1.m_angularVelocity * c;
                        var i = this.m_body2.m_linearVelocity.x + -this.m_body2.m_angularVelocity * f;
                        var j = this.m_body2.m_linearVelocity.y + this.m_body2.m_angularVelocity * e;
                        var k = this.m_u.x * (i - g) + this.m_u.y * (j - h);
                        var l = -this.m_mass * k;
                        this.m_impulse += l;
                        var m = l * this.m_u.x;
                        var n = l * this.m_u.y;
                        this.m_body1.m_linearVelocity.x -= this.m_body1.m_invMass * m;
                        this.m_body1.m_linearVelocity.y -= this.m_body1.m_invMass * n;
                        this.m_body1.m_angularVelocity -= this.m_body1.m_invI * (c * n - d * m);
                        this.m_body2.m_linearVelocity.x += this.m_body2.m_invMass * m;
                        this.m_body2.m_linearVelocity.y += this.m_body2.m_invMass * n;
                        this.m_body2.m_angularVelocity += this.m_body2.m_invI * (e * n - f * m)
                    },
                    SolvePositionConstraints: function () {
                        var a;
                        a = this.m_body1.m_R;
                        var b = a.col1.x * this.m_localAnchor1.x + a.col2.x * this.m_localAnchor1.y;
                        var c = a.col1.y * this.m_localAnchor1.x + a.col2.y * this.m_localAnchor1.y;
                        a = this.m_body2.m_R;
                        var d = a.col1.x * this.m_localAnchor2.x + a.col2.x * this.m_localAnchor2.y;
                        var e = a.col1.y * this.m_localAnchor2.x + a.col2.y * this.m_localAnchor2.y;
                        var f = this.m_body2.m_position.x + d - this.m_body1.m_position.x - b;
                        var g = this.m_body2.m_position.y + e - this.m_body1.m_position.y - c;
                        var h = Math.sqrt(f * f + g * g);
                        f /= h;
                        g /= h;
                        var i = h - this.m_length;
                        i = b2Math.b2Clamp(i, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
                        var j = -this.m_mass * i;
                        this.m_u.Set(f, g);
                        var k = j * this.m_u.x;
                        var l = j * this.m_u.y;
                        this.m_body1.m_position.x -= this.m_body1.m_invMass * k;
                        this.m_body1.m_position.y -= this.m_body1.m_invMass * l;
                        this.m_body1.m_rotation -= this.m_body1.m_invI * (b * l - c * k);
                        this.m_body2.m_position.x += this.m_body2.m_invMass * k;
                        this.m_body2.m_position.y += this.m_body2.m_invMass * l;
                        this.m_body2.m_rotation += this.m_body2.m_invI * (d * l - e * k);
                        this.m_body1.m_R.Set(this.m_body1.m_rotation);
                        this.m_body2.m_R.Set(this.m_body2.m_rotation);
                        return b2Math.b2Abs(i) < b2Settings.b2_linearSlop
                    },
                    GetAnchor1: function () {
                        return b2Math.AddVV(this.m_body1.m_position, b2Math.b2MulMV(this.m_body1.m_R, this.m_localAnchor1))
                    },
                    GetAnchor2: function () {
                        return b2Math.AddVV(this.m_body2.m_position, b2Math.b2MulMV(this.m_body2.m_R, this.m_localAnchor2))
                    },
                    GetReactionForce: function (a) {
                        var b = new b2Vec2;
                        b.SetV(this.m_u);
                        b.Multiply(this.m_impulse * a);
                        return b
                    },
                    GetReactionTorque: function (a) {
                        return 0
                    },
                    m_localAnchor1: new b2Vec2,
                    m_localAnchor2: new b2Vec2,
                    m_u: new b2Vec2,
                    m_impulse: null,
                    m_mass: null,
                    m_length: null
                });
                var b2DistanceJointDef = Class.create();
                Object.extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
                Object.extend(b2DistanceJointDef.prototype, {
                    initialize: function () {
                        this.type = b2Joint.e_unknownJoint;
                        this.userData = null;
                        this.body1 = null;
                        this.body2 = null;
                        this.collideConnected = false;
                        this.anchorPoint1 = new b2Vec2;
                        this.anchorPoint2 = new b2Vec2;
                        this.type = b2Joint.e_distanceJoint
                    }, anchorPoint1: new b2Vec2, anchorPoint2: new b2Vec2
                });
                var b2Jacobian = Class.create();
                b2Jacobian.prototype = {
                    linear1: new b2Vec2,
                    angular1: null,
                    linear2: new b2Vec2,
                    angular2: null,
                    SetZero: function () {
                        this.linear1.SetZero();
                        this.angular1 = 0;
                        this.linear2.SetZero();
                        this.angular2 = 0
                    },
                    Set: function (a, b, c, d) {
                        this.linear1.SetV(a);
                        this.angular1 = b;
                        this.linear2.SetV(c);
                        this.angular2 = d
                    },
                    Compute: function (a, b, c, d) {
                        return this.linear1.x * a.x + this.linear1.y * a.y + this.angular1 * b + (this.linear2.x * c.x + this.linear2.y * c.y) + this.angular2 * d
                    },
                    initialize: function () {
                        this.linear1 = new b2Vec2;
                        this.linear2 = new b2Vec2
                    }
                };
                var b2GearJoint = Class.create();
                Object.extend(b2GearJoint.prototype, b2Joint.prototype);
                Object.extend(b2GearJoint.prototype, {
                    GetAnchor1: function () {
                        var a = this.m_body1.m_R;
                        return new b2Vec2(this.m_body1.m_position.x + (a.col1.x * this.m_localAnchor1.x + a.col2.x * this.m_localAnchor1.y), this.m_body1.m_position.y + (a.col1.y * this.m_localAnchor1.x + a.col2.y * this.m_localAnchor1.y))
                    },
                    GetAnchor2: function () {
                        var a = this.m_body2.m_R;
                        return new b2Vec2(this.m_body2.m_position.x + (a.col1.x * this.m_localAnchor2.x + a.col2.x * this.m_localAnchor2.y), this.m_body2.m_position.y + (a.col1.y * this.m_localAnchor2.x + a.col2.y * this.m_localAnchor2.y))
                    },
                    GetReactionForce: function (a) {
                        return new b2Vec2
                    },
                    GetReactionTorque: function (a) {
                        return 0
                    },
                    GetRatio: function () {
                        return this.m_ratio
                    },
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData;
                        this.m_groundAnchor1 = new b2Vec2;
                        this.m_groundAnchor2 = new b2Vec2;
                        this.m_localAnchor1 = new b2Vec2;
                        this.m_localAnchor2 = new b2Vec2;
                        this.m_J = new b2Jacobian;
                        this.m_revolute1 = null;
                        this.m_prismatic1 = null;
                        this.m_revolute2 = null;
                        this.m_prismatic2 = null;
                        var b;
                        var c;
                        this.m_ground1 = a.joint1.m_body1;
                        this.m_body1 = a.joint1.m_body2;
                        if (a.joint1.m_type == b2Joint.e_revoluteJoint) {
                            this.m_revolute1 = a.joint1;
                            this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
                            this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
                            b = this.m_revolute1.GetJointAngle()
                        } else {
                            this.m_prismatic1 = a.joint1;
                            this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
                            this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
                            b = this.m_prismatic1.GetJointTranslation()
                        }
                        this.m_ground2 = a.joint2.m_body1;
                        this.m_body2 = a.joint2.m_body2;
                        if (a.joint2.m_type == b2Joint.e_revoluteJoint) {
                            this.m_revolute2 = a.joint2;
                            this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
                            this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
                            c = this.m_revolute2.GetJointAngle()
                        } else {
                            this.m_prismatic2 = a.joint2;
                            this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
                            this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
                            c = this.m_prismatic2.GetJointTranslation()
                        }
                        this.m_ratio = a.ratio;
                        this.m_constant = b + this.m_ratio * c;
                        this.m_impulse = 0
                    },
                    PrepareVelocitySolver: function () {
                        var a = this.m_ground1;
                        var b = this.m_ground2;
                        var c = this.m_body1;
                        var d = this.m_body2;
                        var e;
                        var f;
                        var g;
                        var h;
                        var i;
                        var j;
                        var k;
                        var l = 0;
                        this.m_J.SetZero();
                        if (this.m_revolute1) {
                            this.m_J.angular1 = -1;
                            l += c.m_invI
                        } else {
                            i = a.m_R;
                            j = this.m_prismatic1.m_localXAxis1;
                            e = i.col1.x * j.x + i.col2.x * j.y;
                            f = i.col1.y * j.x + i.col2.y * j.y;
                            i = c.m_R;
                            g = i.col1.x * this.m_localAnchor1.x + i.col2.x * this.m_localAnchor1.y;
                            h = i.col1.y * this.m_localAnchor1.x + i.col2.y * this.m_localAnchor1.y;
                            k = g * f - h * e;
                            this.m_J.linear1.Set(-e, -f);
                            this.m_J.angular1 = -k;
                            l += c.m_invMass + c.m_invI * k * k
                        }
                        if (this.m_revolute2) {
                            this.m_J.angular2 = -this.m_ratio;
                            l += this.m_ratio * this.m_ratio * d.m_invI
                        } else {
                            i = b.m_R;
                            j = this.m_prismatic2.m_localXAxis1;
                            e = i.col1.x * j.x + i.col2.x * j.y;
                            f = i.col1.y * j.x + i.col2.y * j.y;
                            i = d.m_R;
                            g = i.col1.x * this.m_localAnchor2.x + i.col2.x * this.m_localAnchor2.y;
                            h = i.col1.y * this.m_localAnchor2.x + i.col2.y * this.m_localAnchor2.y;
                            k = g * f - h * e;
                            this.m_J.linear2.Set(-this.m_ratio * e, -this.m_ratio * f);
                            this.m_J.angular2 = -this.m_ratio * k;
                            l += this.m_ratio * this.m_ratio * (d.m_invMass + d.m_invI * k * k)
                        }
                        this.m_mass = 1 / l;
                        c.m_linearVelocity.x += c.m_invMass * this.m_impulse * this.m_J.linear1.x;
                        c.m_linearVelocity.y += c.m_invMass * this.m_impulse * this.m_J.linear1.y;
                        c.m_angularVelocity += c.m_invI * this.m_impulse * this.m_J.angular1;
                        d.m_linearVelocity.x += d.m_invMass * this.m_impulse * this.m_J.linear2.x;
                        d.m_linearVelocity.y += d.m_invMass * this.m_impulse * this.m_J.linear2.y;
                        d.m_angularVelocity += d.m_invI * this.m_impulse * this.m_J.angular2
                    },
                    SolveVelocityConstraints: function (a) {
                        var b = this.m_body1;
                        var c = this.m_body2;
                        var d = this.m_J.Compute(b.m_linearVelocity, b.m_angularVelocity, c.m_linearVelocity, c.m_angularVelocity);
                        var e = -this.m_mass * d;
                        this.m_impulse += e;
                        b.m_linearVelocity.x += b.m_invMass * e * this.m_J.linear1.x;
                        b.m_linearVelocity.y += b.m_invMass * e * this.m_J.linear1.y;
                        b.m_angularVelocity += b.m_invI * e * this.m_J.angular1;
                        c.m_linearVelocity.x += c.m_invMass * e * this.m_J.linear2.x;
                        c.m_linearVelocity.y += c.m_invMass * e * this.m_J.linear2.y;
                        c.m_angularVelocity += c.m_invI * e * this.m_J.angular2
                    },
                    SolvePositionConstraints: function () {
                        var a = 0;
                        var b = this.m_body1;
                        var c = this.m_body2;
                        var d;
                        var e;
                        if (this.m_revolute1) {
                            d = this.m_revolute1.GetJointAngle()
                        } else {
                            d = this.m_prismatic1.GetJointTranslation()
                        }
                        if (this.m_revolute2) {
                            e = this.m_revolute2.GetJointAngle()
                        } else {
                            e = this.m_prismatic2.GetJointTranslation()
                        }
                        var f = this.m_constant - (d + this.m_ratio * e);
                        var g = -this.m_mass * f;
                        b.m_position.x += b.m_invMass * g * this.m_J.linear1.x;
                        b.m_position.y += b.m_invMass * g * this.m_J.linear1.y;
                        b.m_rotation += b.m_invI * g * this.m_J.angular1;
                        c.m_position.x += c.m_invMass * g * this.m_J.linear2.x;
                        c.m_position.y += c.m_invMass * g * this.m_J.linear2.y;
                        c.m_rotation += c.m_invI * g * this.m_J.angular2;
                        b.m_R.Set(b.m_rotation);
                        c.m_R.Set(c.m_rotation);
                        return a < b2Settings.b2_linearSlop
                    },
                    m_ground1: null,
                    m_ground2: null,
                    m_revolute1: null,
                    m_prismatic1: null,
                    m_revolute2: null,
                    m_prismatic2: null,
                    m_groundAnchor1: new b2Vec2,
                    m_groundAnchor2: new b2Vec2,
                    m_localAnchor1: new b2Vec2,
                    m_localAnchor2: new b2Vec2,
                    m_J: new b2Jacobian,
                    m_constant: null,
                    m_ratio: null,
                    m_mass: null,
                    m_impulse: null
                });
                var b2GearJointDef = Class.create();
                Object.extend(b2GearJointDef.prototype, b2JointDef.prototype);
                Object.extend(b2GearJointDef.prototype, {
                    initialize: function () {
                        this.type = b2Joint.e_gearJoint;
                        this.joint1 = null;
                        this.joint2 = null;
                        this.ratio = 1
                    }, joint1: null, joint2: null, ratio: null
                });
                var b2MouseJoint = Class.create();
                Object.extend(b2MouseJoint.prototype, b2Joint.prototype);
                Object.extend(b2MouseJoint.prototype, {
                    GetAnchor1: function () {
                        return this.m_target
                    },
                    GetAnchor2: function () {
                        var a = b2Math.b2MulMV(this.m_body2.m_R, this.m_localAnchor);
                        a.Add(this.m_body2.m_position);
                        return a
                    },
                    GetReactionForce: function (a) {
                        var b = new b2Vec2;
                        b.SetV(this.m_impulse);
                        b.Multiply(a);
                        return b
                    },
                    GetReactionTorque: function (a) {
                        return 0
                    },
                    SetTarget: function (a) {
                        this.m_body2.WakeUp();
                        this.m_target = a
                    },
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData;
                        this.K = new b2Mat22;
                        this.K1 = new b2Mat22;
                        this.K2 = new b2Mat22;
                        this.m_localAnchor = new b2Vec2;
                        this.m_target = new b2Vec2;
                        this.m_impulse = new b2Vec2;
                        this.m_ptpMass = new b2Mat22;
                        this.m_C = new b2Vec2;
                        this.m_target.SetV(a.target);
                        var b = this.m_target.x - this.m_body2.m_position.x;
                        var c = this.m_target.y - this.m_body2.m_position.y;
                        this.m_localAnchor.x = b * this.m_body2.m_R.col1.x + c * this.m_body2.m_R.col1.y;
                        this.m_localAnchor.y = b * this.m_body2.m_R.col2.x + c * this.m_body2.m_R.col2.y;
                        this.m_maxForce = a.maxForce;
                        this.m_impulse.SetZero();
                        var d = this.m_body2.m_mass;
                        var e = 2 * b2Settings.b2_pi * a.frequencyHz;
                        var f = 2 * d * a.dampingRatio * e;
                        var g = d * e * e;
                        this.m_gamma = 1 / (f + a.timeStep * g);
                        this.m_beta = a.timeStep * g / (f + a.timeStep * g)
                    },
                    K: new b2Mat22,
                    K1: new b2Mat22,
                    K2: new b2Mat22,
                    PrepareVelocitySolver: function () {
                        var a = this.m_body2;
                        var b;
                        b = a.m_R;
                        var c = b.col1.x * this.m_localAnchor.x + b.col2.x * this.m_localAnchor.y;
                        var d = b.col1.y * this.m_localAnchor.x + b.col2.y * this.m_localAnchor.y;
                        var e = a.m_invMass;
                        var f = a.m_invI;
                        this.K1.col1.x = e;
                        this.K1.col2.x = 0;
                        this.K1.col1.y = 0;
                        this.K1.col2.y = e;
                        this.K2.col1.x = f * d * d;
                        this.K2.col2.x = -f * c * d;
                        this.K2.col1.y = -f * c * d;
                        this.K2.col2.y = f * c * c;
                        this.K.SetM(this.K1);
                        this.K.AddM(this.K2);
                        this.K.col1.x += this.m_gamma;
                        this.K.col2.y += this.m_gamma;
                        this.K.Invert(this.m_ptpMass);
                        this.m_C.x = a.m_position.x + c - this.m_target.x;
                        this.m_C.y = a.m_position.y + d - this.m_target.y;
                        a.m_angularVelocity *= .98;
                        var g = this.m_impulse.x;
                        var h = this.m_impulse.y;
                        a.m_linearVelocity.x += e * g;
                        a.m_linearVelocity.y += e * h;
                        a.m_angularVelocity += f * (c * h - d * g)
                    },
                    SolveVelocityConstraints: function (a) {
                        var b = this.m_body2;
                        var c;
                        c = b.m_R;
                        var d = c.col1.x * this.m_localAnchor.x + c.col2.x * this.m_localAnchor.y;
                        var e = c.col1.y * this.m_localAnchor.x + c.col2.y * this.m_localAnchor.y;
                        var f = b.m_linearVelocity.x + -b.m_angularVelocity * e;
                        var g = b.m_linearVelocity.y + b.m_angularVelocity * d;
                        c = this.m_ptpMass;
                        var h = f + this.m_beta * a.inv_dt * this.m_C.x + this.m_gamma * this.m_impulse.x;
                        var i = g + this.m_beta * a.inv_dt * this.m_C.y + this.m_gamma * this.m_impulse.y;
                        var j = -(c.col1.x * h + c.col2.x * i);
                        var k = -(c.col1.y * h + c.col2.y * i);
                        var l = this.m_impulse.x;
                        var m = this.m_impulse.y;
                        this.m_impulse.x += j;
                        this.m_impulse.y += k;
                        var n = this.m_impulse.Length();
                        if (n > a.dt * this.m_maxForce) {
                            this.m_impulse.Multiply(a.dt * this.m_maxForce / n)
                        }
                        j = this.m_impulse.x - l;
                        k = this.m_impulse.y - m;
                        b.m_linearVelocity.x += b.m_invMass * j;
                        b.m_linearVelocity.y += b.m_invMass * k;
                        b.m_angularVelocity += b.m_invI * (d * k - e * j)
                    },
                    SolvePositionConstraints: function () {
                        return true
                    },
                    m_localAnchor: new b2Vec2,
                    m_target: new b2Vec2,
                    m_impulse: new b2Vec2,
                    m_ptpMass: new b2Mat22,
                    m_C: new b2Vec2,
                    m_maxForce: null,
                    m_beta: null,
                    m_gamma: null
                });
                var b2MouseJointDef = Class.create();
                Object.extend(b2MouseJointDef.prototype, b2JointDef.prototype);
                Object.extend(b2MouseJointDef.prototype, {
                    initialize: function () {
                        this.type = b2Joint.e_unknownJoint;
                        this.userData = null;
                        this.body1 = null;
                        this.body2 = null;
                        this.collideConnected = false;
                        this.target = new b2Vec2;
                        this.type = b2Joint.e_mouseJoint;
                        this.maxForce = 0;
                        this.frequencyHz = 5;
                        this.dampingRatio = .7;
                        this.timeStep = 1 / 60
                    }, target: new b2Vec2, maxForce: null, frequencyHz: null, dampingRatio: null, timeStep: null
                });
                var b2PrismaticJoint = Class.create();
                Object.extend(b2PrismaticJoint.prototype, b2Joint.prototype);
                Object.extend(b2PrismaticJoint.prototype, {
                    GetAnchor1: function () {
                        var a = this.m_body1;
                        var b = new b2Vec2;
                        b.SetV(this.m_localAnchor1);
                        b.MulM(a.m_R);
                        b.Add(a.m_position);
                        return b
                    },
                    GetAnchor2: function () {
                        var a = this.m_body2;
                        var b = new b2Vec2;
                        b.SetV(this.m_localAnchor2);
                        b.MulM(a.m_R);
                        b.Add(a.m_position);
                        return b
                    },
                    GetJointTranslation: function () {
                        var a = this.m_body1;
                        var b = this.m_body2;
                        var c;
                        c = a.m_R;
                        var d = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                        var e = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                        c = b.m_R;
                        var f = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                        var g = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                        var h = a.m_position.x + d;
                        var i = a.m_position.y + e;
                        var j = b.m_position.x + f;
                        var k = b.m_position.y + g;
                        var l = j - h;
                        var m = k - i;
                        c = a.m_R;
                        var n = c.col1.x * this.m_localXAxis1.x + c.col2.x * this.m_localXAxis1.y;
                        var o = c.col1.y * this.m_localXAxis1.x + c.col2.y * this.m_localXAxis1.y;
                        var p = n * l + o * m;
                        return p
                    },
                    GetJointSpeed: function () {
                        var a = this.m_body1;
                        var b = this.m_body2;
                        var c;
                        c = a.m_R;
                        var d = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                        var e = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                        c = b.m_R;
                        var f = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                        var g = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                        var h = a.m_position.x + d;
                        var i = a.m_position.y + e;
                        var j = b.m_position.x + f;
                        var k = b.m_position.y + g;
                        var l = j - h;
                        var m = k - i;
                        c = a.m_R;
                        var n = c.col1.x * this.m_localXAxis1.x + c.col2.x * this.m_localXAxis1.y;
                        var o = c.col1.y * this.m_localXAxis1.x + c.col2.y * this.m_localXAxis1.y;
                        var p = a.m_linearVelocity;
                        var q = b.m_linearVelocity;
                        var r = a.m_angularVelocity;
                        var s = b.m_angularVelocity;
                        var t = l * -r * o + m * r * n + (n * (q.x + -s * g - p.x - -r * e) + o * (q.y + s * f - p.y - r * d));
                        return t
                    },
                    GetMotorForce: function (a) {
                        return a * this.m_motorImpulse
                    },
                    SetMotorSpeed: function (a) {
                        this.m_motorSpeed = a
                    },
                    SetMotorForce: function (a) {
                        this.m_maxMotorForce = a
                    },
                    GetReactionForce: function (a) {
                        var b = a * this.m_limitImpulse;
                        var c;
                        c = this.m_body1.m_R;
                        var d = b * (c.col1.x * this.m_localXAxis1.x + c.col2.x * this.m_localXAxis1.y);
                        var e = b * (c.col1.y * this.m_localXAxis1.x + c.col2.y * this.m_localXAxis1.y);
                        var f = b * (c.col1.x * this.m_localYAxis1.x + c.col2.x * this.m_localYAxis1.y);
                        var g = b * (c.col1.y * this.m_localYAxis1.x + c.col2.y * this.m_localYAxis1.y);
                        return new b2Vec2(d + f, e + g)
                    },
                    GetReactionTorque: function (a) {
                        return a * this.m_angularImpulse
                    },
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData;
                        this.m_localAnchor1 = new b2Vec2;
                        this.m_localAnchor2 = new b2Vec2;
                        this.m_localXAxis1 = new b2Vec2;
                        this.m_localYAxis1 = new b2Vec2;
                        this.m_linearJacobian = new b2Jacobian;
                        this.m_motorJacobian = new b2Jacobian;
                        var b;
                        var c;
                        var d;
                        b = this.m_body1.m_R;
                        c = a.anchorPoint.x - this.m_body1.m_position.x;
                        d = a.anchorPoint.y - this.m_body1.m_position.y;
                        this.m_localAnchor1.Set(c * b.col1.x + d * b.col1.y, c * b.col2.x + d * b.col2.y);
                        b = this.m_body2.m_R;
                        c = a.anchorPoint.x - this.m_body2.m_position.x;
                        d = a.anchorPoint.y - this.m_body2.m_position.y;
                        this.m_localAnchor2.Set(c * b.col1.x + d * b.col1.y, c * b.col2.x + d * b.col2.y);
                        b = this.m_body1.m_R;
                        c = a.axis.x;
                        d = a.axis.y;
                        this.m_localXAxis1.Set(c * b.col1.x + d * b.col1.y, c * b.col2.x + d * b.col2.y);
                        this.m_localYAxis1.x = -this.m_localXAxis1.y;
                        this.m_localYAxis1.y = this.m_localXAxis1.x;
                        this.m_initialAngle = this.m_body2.m_rotation - this.m_body1.m_rotation;
                        this.m_linearJacobian.SetZero();
                        this.m_linearMass = 0;
                        this.m_linearImpulse = 0;
                        this.m_angularMass = 0;
                        this.m_angularImpulse = 0;
                        this.m_motorJacobian.SetZero();
                        this.m_motorMass = 0;
                        this.m_motorImpulse = 0;
                        this.m_limitImpulse = 0;
                        this.m_limitPositionImpulse = 0;
                        this.m_lowerTranslation = a.lowerTranslation;
                        this.m_upperTranslation = a.upperTranslation;
                        this.m_maxMotorForce = a.motorForce;
                        this.m_motorSpeed = a.motorSpeed;
                        this.m_enableLimit = a.enableLimit;
                        this.m_enableMotor = a.enableMotor
                    },
                    PrepareVelocitySolver: function () {
                        var a = this.m_body1;
                        var b = this.m_body2;
                        var c;
                        c = a.m_R;
                        var d = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                        var e = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                        c = b.m_R;
                        var f = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                        var g = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                        var h = a.m_invMass;
                        var i = b.m_invMass;
                        var j = a.m_invI;
                        var k = b.m_invI;
                        c = a.m_R;
                        var l = c.col1.x * this.m_localYAxis1.x + c.col2.x * this.m_localYAxis1.y;
                        var m = c.col1.y * this.m_localYAxis1.x + c.col2.y * this.m_localYAxis1.y;
                        var n = b.m_position.x + f - a.m_position.x;
                        var o = b.m_position.y + g - a.m_position.y;
                        this.m_linearJacobian.linear1.x = -l;
                        this.m_linearJacobian.linear1.y = -m;
                        this.m_linearJacobian.linear2.x = l;
                        this.m_linearJacobian.linear2.y = m;
                        this.m_linearJacobian.angular1 = -(n * m - o * l);
                        this.m_linearJacobian.angular2 = f * m - g * l;
                        this.m_linearMass = h + j * this.m_linearJacobian.angular1 * this.m_linearJacobian.angular1 + i + k * this.m_linearJacobian.angular2 * this.m_linearJacobian.angular2;
                        this.m_linearMass = 1 / this.m_linearMass;
                        this.m_angularMass = 1 / (j + k);
                        if (this.m_enableLimit || this.m_enableMotor) {
                            c = a.m_R;
                            var p = c.col1.x * this.m_localXAxis1.x + c.col2.x * this.m_localXAxis1.y;
                            var q = c.col1.y * this.m_localXAxis1.x + c.col2.y * this.m_localXAxis1.y;
                            this.m_motorJacobian.linear1.x = -p;
                            this.m_motorJacobian.linear1.y = -q;
                            this.m_motorJacobian.linear2.x = p;
                            this.m_motorJacobian.linear2.y = q;
                            this.m_motorJacobian.angular1 = -(n * q - o * p);
                            this.m_motorJacobian.angular2 = f * q - g * p;
                            this.m_motorMass = h + j * this.m_motorJacobian.angular1 * this.m_motorJacobian.angular1 + i + k * this.m_motorJacobian.angular2 * this.m_motorJacobian.angular2;
                            this.m_motorMass = 1 / this.m_motorMass;
                            if (this.m_enableLimit) {
                                var r = n - d;
                                var s = o - e;
                                var t = p * r + q * s;
                                if (b2Math.b2Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
                                    this.m_limitState = b2Joint.e_equalLimits
                                } else if (t <= this.m_lowerTranslation) {
                                    if (this.m_limitState != b2Joint.e_atLowerLimit) {
                                        this.m_limitImpulse = 0
                                    }
                                    this.m_limitState = b2Joint.e_atLowerLimit
                                } else if (t >= this.m_upperTranslation) {
                                    if (this.m_limitState != b2Joint.e_atUpperLimit) {
                                        this.m_limitImpulse = 0
                                    }
                                    this.m_limitState = b2Joint.e_atUpperLimit
                                } else {
                                    this.m_limitState = b2Joint.e_inactiveLimit;
                                    this.m_limitImpulse = 0
                                }
                            }
                        }
                        if (this.m_enableMotor == false) {
                            this.m_motorImpulse = 0
                        }
                        if (this.m_enableLimit == false) {
                            this.m_limitImpulse = 0
                        }
                        if (b2World.s_enableWarmStarting) {
                            var u = this.m_linearImpulse * this.m_linearJacobian.linear1.x + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear1.x;
                            var v = this.m_linearImpulse * this.m_linearJacobian.linear1.y + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear1.y;
                            var w = this.m_linearImpulse * this.m_linearJacobian.linear2.x + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear2.x;
                            var x = this.m_linearImpulse * this.m_linearJacobian.linear2.y + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.linear2.y;
                            var y = this.m_linearImpulse * this.m_linearJacobian.angular1 - this.m_angularImpulse + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.angular1;
                            var z = this.m_linearImpulse * this.m_linearJacobian.angular2 + this.m_angularImpulse + (this.m_motorImpulse + this.m_limitImpulse) * this.m_motorJacobian.angular2;
                            a.m_linearVelocity.x += h * u;
                            a.m_linearVelocity.y += h * v;
                            a.m_angularVelocity += j * y;
                            b.m_linearVelocity.x += i * w;
                            b.m_linearVelocity.y += i * x;
                            b.m_angularVelocity += k * z
                        } else {
                            this.m_linearImpulse = 0;
                            this.m_angularImpulse = 0;
                            this.m_limitImpulse = 0;
                            this.m_motorImpulse = 0
                        }
                        this.m_limitPositionImpulse = 0
                    },
                    SolveVelocityConstraints: function (a) {
                        var b = this.m_body1;
                        var c = this.m_body2;
                        var d = b.m_invMass;
                        var e = c.m_invMass;
                        var f = b.m_invI;
                        var g = c.m_invI;
                        var h;
                        var i = this.m_linearJacobian.Compute(b.m_linearVelocity, b.m_angularVelocity, c.m_linearVelocity, c.m_angularVelocity);
                        var j = -this.m_linearMass * i;
                        this.m_linearImpulse += j;
                        b.m_linearVelocity.x += d * j * this.m_linearJacobian.linear1.x;
                        b.m_linearVelocity.y += d * j * this.m_linearJacobian.linear1.y;
                        b.m_angularVelocity += f * j * this.m_linearJacobian.angular1;
                        c.m_linearVelocity.x += e * j * this.m_linearJacobian.linear2.x;
                        c.m_linearVelocity.y += e * j * this.m_linearJacobian.linear2.y;
                        c.m_angularVelocity += g * j * this.m_linearJacobian.angular2;
                        var k = c.m_angularVelocity - b.m_angularVelocity;
                        var l = -this.m_angularMass * k;
                        this.m_angularImpulse += l;
                        b.m_angularVelocity -= f * l;
                        c.m_angularVelocity += g * l;
                        if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
                            var m = this.m_motorJacobian.Compute(b.m_linearVelocity, b.m_angularVelocity, c.m_linearVelocity, c.m_angularVelocity) - this.m_motorSpeed;
                            var n = -this.m_motorMass * m;
                            var o = this.m_motorImpulse;
                            this.m_motorImpulse = b2Math.b2Clamp(this.m_motorImpulse + n, -a.dt * this.m_maxMotorForce, a.dt * this.m_maxMotorForce);
                            n = this.m_motorImpulse - o;
                            b.m_linearVelocity.x += d * n * this.m_motorJacobian.linear1.x;
                            b.m_linearVelocity.y += d * n * this.m_motorJacobian.linear1.y;
                            b.m_angularVelocity += f * n * this.m_motorJacobian.angular1;
                            c.m_linearVelocity.x += e * n * this.m_motorJacobian.linear2.x;
                            c.m_linearVelocity.y += e * n * this.m_motorJacobian.linear2.y;
                            c.m_angularVelocity += g * n * this.m_motorJacobian.angular2
                        }
                        if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
                            var p = this.m_motorJacobian.Compute(b.m_linearVelocity, b.m_angularVelocity, c.m_linearVelocity, c.m_angularVelocity);
                            var q = -this.m_motorMass * p;
                            if (this.m_limitState == b2Joint.e_equalLimits) {
                                this.m_limitImpulse += q
                            } else if (this.m_limitState == b2Joint.e_atLowerLimit) {
                                h = this.m_limitImpulse;
                                this.m_limitImpulse = b2Math.b2Max(this.m_limitImpulse + q, 0);
                                q = this.m_limitImpulse - h
                            } else if (this.m_limitState == b2Joint.e_atUpperLimit) {
                                h = this.m_limitImpulse;
                                this.m_limitImpulse = b2Math.b2Min(this.m_limitImpulse + q, 0);
                                q = this.m_limitImpulse - h
                            }
                            b.m_linearVelocity.x += d * q * this.m_motorJacobian.linear1.x;
                            b.m_linearVelocity.y += d * q * this.m_motorJacobian.linear1.y;
                            b.m_angularVelocity += f * q * this.m_motorJacobian.angular1;
                            c.m_linearVelocity.x += e * q * this.m_motorJacobian.linear2.x;
                            c.m_linearVelocity.y += e * q * this.m_motorJacobian.linear2.y;
                            c.m_angularVelocity += g * q * this.m_motorJacobian.angular2
                        }
                    },
                    SolvePositionConstraints: function () {
                        var a;
                        var b;
                        var c = this.m_body1;
                        var d = this.m_body2;
                        var e = c.m_invMass;
                        var f = d.m_invMass;
                        var g = c.m_invI;
                        var h = d.m_invI;
                        var i;
                        i = c.m_R;
                        var j = i.col1.x * this.m_localAnchor1.x + i.col2.x * this.m_localAnchor1.y;
                        var k = i.col1.y * this.m_localAnchor1.x + i.col2.y * this.m_localAnchor1.y;
                        i = d.m_R;
                        var l = i.col1.x * this.m_localAnchor2.x + i.col2.x * this.m_localAnchor2.y;
                        var m = i.col1.y * this.m_localAnchor2.x + i.col2.y * this.m_localAnchor2.y;
                        var n = c.m_position.x + j;
                        var o = c.m_position.y + k;
                        var p = d.m_position.x + l;
                        var q = d.m_position.y + m;
                        var r = p - n;
                        var s = q - o;
                        i = c.m_R;
                        var t = i.col1.x * this.m_localYAxis1.x + i.col2.x * this.m_localYAxis1.y;
                        var u = i.col1.y * this.m_localYAxis1.x + i.col2.y * this.m_localYAxis1.y;
                        var v = t * r + u * s;
                        v = b2Math.b2Clamp(v, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
                        var w = -this.m_linearMass * v;
                        c.m_position.x += e * w * this.m_linearJacobian.linear1.x;
                        c.m_position.y += e * w * this.m_linearJacobian.linear1.y;
                        c.m_rotation += g * w * this.m_linearJacobian.angular1;
                        d.m_position.x += f * w * this.m_linearJacobian.linear2.x;
                        d.m_position.y += f * w * this.m_linearJacobian.linear2.y;
                        d.m_rotation += h * w * this.m_linearJacobian.angular2;
                        var x = b2Math.b2Abs(v);
                        var y = d.m_rotation - c.m_rotation - this.m_initialAngle;
                        y = b2Math.b2Clamp(y, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
                        var z = -this.m_angularMass * y;
                        c.m_rotation -= c.m_invI * z;
                        c.m_R.Set(c.m_rotation);
                        d.m_rotation += d.m_invI * z;
                        d.m_R.Set(d.m_rotation);
                        var A = b2Math.b2Abs(y);
                        if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
                            i = c.m_R;
                            j = i.col1.x * this.m_localAnchor1.x + i.col2.x * this.m_localAnchor1.y;
                            k = i.col1.y * this.m_localAnchor1.x + i.col2.y * this.m_localAnchor1.y;
                            i = d.m_R;
                            l = i.col1.x * this.m_localAnchor2.x + i.col2.x * this.m_localAnchor2.y;
                            m = i.col1.y * this.m_localAnchor2.x + i.col2.y * this.m_localAnchor2.y;
                            n = c.m_position.x + j;
                            o = c.m_position.y + k;
                            p = d.m_position.x + l;
                            q = d.m_position.y + m;
                            r = p - n;
                            s = q - o;
                            i = c.m_R;
                            var B = i.col1.x * this.m_localXAxis1.x + i.col2.x * this.m_localXAxis1.y;
                            var C = i.col1.y * this.m_localXAxis1.x + i.col2.y * this.m_localXAxis1.y;
                            var D = B * r + C * s;
                            var E = 0;
                            if (this.m_limitState == b2Joint.e_equalLimits) {
                                a = b2Math.b2Clamp(D, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
                                E = -this.m_motorMass * a;
                                x = b2Math.b2Max(x, b2Math.b2Abs(y))
                            } else if (this.m_limitState == b2Joint.e_atLowerLimit) {
                                a = D - this.m_lowerTranslation;
                                x = b2Math.b2Max(x, -a);
                                a = b2Math.b2Clamp(a + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
                                E = -this.m_motorMass * a;
                                b = this.m_limitPositionImpulse;
                                this.m_limitPositionImpulse = b2Math.b2Max(this.m_limitPositionImpulse + E, 0);
                                E = this.m_limitPositionImpulse - b
                            } else if (this.m_limitState == b2Joint.e_atUpperLimit) {
                                a = D - this.m_upperTranslation;
                                x = b2Math.b2Max(x, a);
                                a = b2Math.b2Clamp(a - b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
                                E = -this.m_motorMass * a;
                                b = this.m_limitPositionImpulse;
                                this.m_limitPositionImpulse = b2Math.b2Min(this.m_limitPositionImpulse + E, 0);
                                E = this.m_limitPositionImpulse - b
                            }
                            c.m_position.x += e * E * this.m_motorJacobian.linear1.x;
                            c.m_position.y += e * E * this.m_motorJacobian.linear1.y;
                            c.m_rotation += g * E * this.m_motorJacobian.angular1;
                            c.m_R.Set(c.m_rotation);
                            d.m_position.x += f * E * this.m_motorJacobian.linear2.x;
                            d.m_position.y += f * E * this.m_motorJacobian.linear2.y;
                            d.m_rotation += h * E * this.m_motorJacobian.angular2;
                            d.m_R.Set(d.m_rotation)
                        }
                        return x <= b2Settings.b2_linearSlop && A <= b2Settings.b2_angularSlop
                    },
                    m_localAnchor1: new b2Vec2,
                    m_localAnchor2: new b2Vec2,
                    m_localXAxis1: new b2Vec2,
                    m_localYAxis1: new b2Vec2,
                    m_initialAngle: null,
                    m_linearJacobian: new b2Jacobian,
                    m_linearMass: null,
                    m_linearImpulse: null,
                    m_angularMass: null,
                    m_angularImpulse: null,
                    m_motorJacobian: new b2Jacobian,
                    m_motorMass: null,
                    m_motorImpulse: null,
                    m_limitImpulse: null,
                    m_limitPositionImpulse: null,
                    m_lowerTranslation: null,
                    m_upperTranslation: null,
                    m_maxMotorForce: null,
                    m_motorSpeed: null,
                    m_enableLimit: null,
                    m_enableMotor: null,
                    m_limitState: 0
                });
                var b2PrismaticJointDef = Class.create();
                Object.extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
                Object.extend(b2PrismaticJointDef.prototype, {
                    initialize: function () {
                        this.type = b2Joint.e_unknownJoint;
                        this.userData = null;
                        this.body1 = null;
                        this.body2 = null;
                        this.collideConnected = false;
                        this.type = b2Joint.e_prismaticJoint;
                        this.anchorPoint = new b2Vec2(0, 0);
                        this.axis = new b2Vec2(0, 0);
                        this.lowerTranslation = 0;
                        this.upperTranslation = 0;
                        this.motorForce = 0;
                        this.motorSpeed = 0;
                        this.enableLimit = false;
                        this.enableMotor = false
                    },
                    anchorPoint: null,
                    axis: null,
                    lowerTranslation: null,
                    upperTranslation: null,
                    motorForce: null,
                    motorSpeed: null,
                    enableLimit: null,
                    enableMotor: null
                });
                var b2PulleyJoint = Class.create();
                Object.extend(b2PulleyJoint.prototype, b2Joint.prototype);
                Object.extend(b2PulleyJoint.prototype, {
                    GetAnchor1: function () {
                        var a = this.m_body1.m_R;
                        return new b2Vec2(this.m_body1.m_position.x + (a.col1.x * this.m_localAnchor1.x + a.col2.x * this.m_localAnchor1.y), this.m_body1.m_position.y + (a.col1.y * this.m_localAnchor1.x + a.col2.y * this.m_localAnchor1.y))
                    },
                    GetAnchor2: function () {
                        var a = this.m_body2.m_R;
                        return new b2Vec2(this.m_body2.m_position.x + (a.col1.x * this.m_localAnchor2.x + a.col2.x * this.m_localAnchor2.y), this.m_body2.m_position.y + (a.col1.y * this.m_localAnchor2.x + a.col2.y * this.m_localAnchor2.y))
                    },
                    GetGroundPoint1: function () {
                        return new b2Vec2(this.m_ground.m_position.x + this.m_groundAnchor1.x, this.m_ground.m_position.y + this.m_groundAnchor1.y)
                    },
                    GetGroundPoint2: function () {
                        return new b2Vec2(this.m_ground.m_position.x + this.m_groundAnchor2.x, this.m_ground.m_position.y + this.m_groundAnchor2.y)
                    },
                    GetReactionForce: function (a) {
                        return new b2Vec2
                    },
                    GetReactionTorque: function (a) {
                        return 0
                    },
                    GetLength1: function () {
                        var a;
                        a = this.m_body1.m_R;
                        var b = this.m_body1.m_position.x + (a.col1.x * this.m_localAnchor1.x + a.col2.x * this.m_localAnchor1.y);
                        var c = this.m_body1.m_position.y + (a.col1.y * this.m_localAnchor1.x + a.col2.y * this.m_localAnchor1.y);
                        var d = b - (this.m_ground.m_position.x + this.m_groundAnchor1.x);
                        var e = c - (this.m_ground.m_position.y + this.m_groundAnchor1.y);
                        return Math.sqrt(d * d + e * e)
                    },
                    GetLength2: function () {
                        var a;
                        a = this.m_body2.m_R;
                        var b = this.m_body2.m_position.x + (a.col1.x * this.m_localAnchor2.x + a.col2.x * this.m_localAnchor2.y);
                        var c = this.m_body2.m_position.y + (a.col1.y * this.m_localAnchor2.x + a.col2.y * this.m_localAnchor2.y);
                        var d = b - (this.m_ground.m_position.x + this.m_groundAnchor2.x);
                        var e = c - (this.m_ground.m_position.y + this.m_groundAnchor2.y);
                        return Math.sqrt(d * d + e * e)
                    },
                    GetRatio: function () {
                        return this.m_ratio
                    },
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData;
                        this.m_groundAnchor1 = new b2Vec2;
                        this.m_groundAnchor2 = new b2Vec2;
                        this.m_localAnchor1 = new b2Vec2;
                        this.m_localAnchor2 = new b2Vec2;
                        this.m_u1 = new b2Vec2;
                        this.m_u2 = new b2Vec2;
                        var b;
                        var c;
                        var d;
                        this.m_ground = this.m_body1.m_world.m_groundBody;
                        this.m_groundAnchor1.x = a.groundPoint1.x - this.m_ground.m_position.x;
                        this.m_groundAnchor1.y = a.groundPoint1.y - this.m_ground.m_position.y;
                        this.m_groundAnchor2.x = a.groundPoint2.x - this.m_ground.m_position.x;
                        this.m_groundAnchor2.y = a.groundPoint2.y - this.m_ground.m_position.y;
                        b = this.m_body1.m_R;
                        c = a.anchorPoint1.x - this.m_body1.m_position.x;
                        d = a.anchorPoint1.y - this.m_body1.m_position.y;
                        this.m_localAnchor1.x = c * b.col1.x + d * b.col1.y;
                        this.m_localAnchor1.y = c * b.col2.x + d * b.col2.y;
                        b = this.m_body2.m_R;
                        c = a.anchorPoint2.x - this.m_body2.m_position.x;
                        d = a.anchorPoint2.y - this.m_body2.m_position.y;
                        this.m_localAnchor2.x = c * b.col1.x + d * b.col1.y;
                        this.m_localAnchor2.y = c * b.col2.x + d * b.col2.y;
                        this.m_ratio = a.ratio;
                        c = a.groundPoint1.x - a.anchorPoint1.x;
                        d = a.groundPoint1.y - a.anchorPoint1.y;
                        var e = Math.sqrt(c * c + d * d);
                        c = a.groundPoint2.x - a.anchorPoint2.x;
                        d = a.groundPoint2.y - a.anchorPoint2.y;
                        var f = Math.sqrt(c * c + d * d);
                        var g = b2Math.b2Max(.5 * b2PulleyJoint.b2_minPulleyLength, e);
                        var h = b2Math.b2Max(.5 * b2PulleyJoint.b2_minPulleyLength, f);
                        this.m_constant = g + this.m_ratio * h;
                        this.m_maxLength1 = b2Math.b2Clamp(a.maxLength1, g, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
                        this.m_maxLength2 = b2Math.b2Clamp(a.maxLength2, h, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
                        this.m_pulleyImpulse = 0;
                        this.m_limitImpulse1 = 0;
                        this.m_limitImpulse2 = 0
                    },
                    PrepareVelocitySolver: function () {
                        var a = this.m_body1;
                        var b = this.m_body2;
                        var c;
                        c = a.m_R;
                        var d = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                        var e = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                        c = b.m_R;
                        var f = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                        var g = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                        var h = a.m_position.x + d;
                        var i = a.m_position.y + e;
                        var j = b.m_position.x + f;
                        var k = b.m_position.y + g;
                        var l = this.m_ground.m_position.x + this.m_groundAnchor1.x;
                        var m = this.m_ground.m_position.y + this.m_groundAnchor1.y;
                        var n = this.m_ground.m_position.x + this.m_groundAnchor2.x;
                        var o = this.m_ground.m_position.y + this.m_groundAnchor2.y;
                        this.m_u1.Set(h - l, i - m);
                        this.m_u2.Set(j - n, k - o);
                        var p = this.m_u1.Length();
                        var q = this.m_u2.Length();
                        if (p > b2Settings.b2_linearSlop) {
                            this.m_u1.Multiply(1 / p)
                        } else {
                            this.m_u1.SetZero()
                        }
                        if (q > b2Settings.b2_linearSlop) {
                            this.m_u2.Multiply(1 / q)
                        } else {
                            this.m_u2.SetZero()
                        }
                        if (p < this.m_maxLength1) {
                            this.m_limitState1 = b2Joint.e_inactiveLimit;
                            this.m_limitImpulse1 = 0
                        } else {
                            this.m_limitState1 = b2Joint.e_atUpperLimit;
                            this.m_limitPositionImpulse1 = 0
                        }
                        if (q < this.m_maxLength2) {
                            this.m_limitState2 = b2Joint.e_inactiveLimit;
                            this.m_limitImpulse2 = 0
                        } else {
                            this.m_limitState2 = b2Joint.e_atUpperLimit;
                            this.m_limitPositionImpulse2 = 0
                        }
                        var r = d * this.m_u1.y - e * this.m_u1.x;
                        var s = f * this.m_u2.y - g * this.m_u2.x;
                        this.m_limitMass1 = a.m_invMass + a.m_invI * r * r;
                        this.m_limitMass2 = b.m_invMass + b.m_invI * s * s;
                        this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
                        this.m_limitMass1 = 1 / this.m_limitMass1;
                        this.m_limitMass2 = 1 / this.m_limitMass2;
                        this.m_pulleyMass = 1 / this.m_pulleyMass;
                        var t = (-this.m_pulleyImpulse - this.m_limitImpulse1) * this.m_u1.x;
                        var u = (-this.m_pulleyImpulse - this.m_limitImpulse1) * this.m_u1.y;
                        var v = (-this.m_ratio * this.m_pulleyImpulse - this.m_limitImpulse2) * this.m_u2.x;
                        var w = (-this.m_ratio * this.m_pulleyImpulse - this.m_limitImpulse2) * this.m_u2.y;
                        a.m_linearVelocity.x += a.m_invMass * t;
                        a.m_linearVelocity.y += a.m_invMass * u;
                        a.m_angularVelocity += a.m_invI * (d * u - e * t);
                        b.m_linearVelocity.x += b.m_invMass * v;
                        b.m_linearVelocity.y += b.m_invMass * w;
                        b.m_angularVelocity += b.m_invI * (f * w - g * v)
                    },
                    SolveVelocityConstraints: function (a) {
                        var b = this.m_body1;
                        var c = this.m_body2;
                        var d;
                        d = b.m_R;
                        var e = d.col1.x * this.m_localAnchor1.x + d.col2.x * this.m_localAnchor1.y;
                        var f = d.col1.y * this.m_localAnchor1.x + d.col2.y * this.m_localAnchor1.y;
                        d = c.m_R;
                        var g = d.col1.x * this.m_localAnchor2.x + d.col2.x * this.m_localAnchor2.y;
                        var h = d.col1.y * this.m_localAnchor2.x + d.col2.y * this.m_localAnchor2.y;
                        var i;
                        var j;
                        var k;
                        var l;
                        var m;
                        var n;
                        var o;
                        var p;
                        var q;
                        var r;
                        var s;
                        i = b.m_linearVelocity.x + -b.m_angularVelocity * f;
                        j = b.m_linearVelocity.y + b.m_angularVelocity * e;
                        k = c.m_linearVelocity.x + -c.m_angularVelocity * h;
                        l = c.m_linearVelocity.y + c.m_angularVelocity * g;
                        q = -(this.m_u1.x * i + this.m_u1.y * j) - this.m_ratio * (this.m_u2.x * k + this.m_u2.y * l);
                        r = -this.m_pulleyMass * q;
                        this.m_pulleyImpulse += r;
                        m = -r * this.m_u1.x;
                        n = -r * this.m_u1.y;
                        o = -this.m_ratio * r * this.m_u2.x;
                        p = -this.m_ratio * r * this.m_u2.y;
                        b.m_linearVelocity.x += b.m_invMass * m;
                        b.m_linearVelocity.y += b.m_invMass * n;
                        b.m_angularVelocity += b.m_invI * (e * n - f * m);
                        c.m_linearVelocity.x += c.m_invMass * o;
                        c.m_linearVelocity.y += c.m_invMass * p;
                        c.m_angularVelocity += c.m_invI * (g * p - h * o);
                        if (this.m_limitState1 == b2Joint.e_atUpperLimit) {
                            i = b.m_linearVelocity.x + -b.m_angularVelocity * f;
                            j = b.m_linearVelocity.y + b.m_angularVelocity * e;
                            q = -(this.m_u1.x * i + this.m_u1.y * j);
                            r = -this.m_limitMass1 * q;
                            s = this.m_limitImpulse1;
                            this.m_limitImpulse1 = b2Math.b2Max(0, this.m_limitImpulse1 + r);
                            r = this.m_limitImpulse1 - s;
                            m = -r * this.m_u1.x;
                            n = -r * this.m_u1.y;
                            b.m_linearVelocity.x += b.m_invMass * m;
                            b.m_linearVelocity.y += b.m_invMass * n;
                            b.m_angularVelocity += b.m_invI * (e * n - f * m)
                        }
                        if (this.m_limitState2 == b2Joint.e_atUpperLimit) {
                            k = c.m_linearVelocity.x + -c.m_angularVelocity * h;
                            l = c.m_linearVelocity.y + c.m_angularVelocity * g;
                            q = -(this.m_u2.x * k + this.m_u2.y * l);
                            r = -this.m_limitMass2 * q;
                            s = this.m_limitImpulse2;
                            this.m_limitImpulse2 = b2Math.b2Max(0, this.m_limitImpulse2 + r);
                            r = this.m_limitImpulse2 - s;
                            o = -r * this.m_u2.x;
                            p = -r * this.m_u2.y;
                            c.m_linearVelocity.x += c.m_invMass * o;
                            c.m_linearVelocity.y += c.m_invMass * p;
                            c.m_angularVelocity += c.m_invI * (g * p - h * o)
                        }
                    },
                    SolvePositionConstraints: function () {
                        var a = this.m_body1;
                        var b = this.m_body2;
                        var c;
                        var d = this.m_ground.m_position.x + this.m_groundAnchor1.x;
                        var e = this.m_ground.m_position.y + this.m_groundAnchor1.y;
                        var f = this.m_ground.m_position.x + this.m_groundAnchor2.x;
                        var g = this.m_ground.m_position.y + this.m_groundAnchor2.y;
                        var h;
                        var i;
                        var j;
                        var k;
                        var l;
                        var m;
                        var n;
                        var o;
                        var p;
                        var q;
                        var r;
                        var s;
                        var t;
                        var u = 0;
                        {
                            c = a.m_R;
                            h = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                            i = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                            c = b.m_R;
                            j = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                            k = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                            l = a.m_position.x + h;
                            m = a.m_position.y + i;
                            n = b.m_position.x + j;
                            o = b.m_position.y + k;
                            this.m_u1.Set(l - d, m - e);
                            this.m_u2.Set(n - f, o - g);
                            p = this.m_u1.Length();
                            q = this.m_u2.Length();
                            if (p > b2Settings.b2_linearSlop) {
                                this.m_u1.Multiply(1 / p)
                            } else {
                                this.m_u1.SetZero()
                            }
                            if (q > b2Settings.b2_linearSlop) {
                                this.m_u2.Multiply(1 / q)
                            } else {
                                this.m_u2.SetZero()
                            }
                            r = this.m_constant - p - this.m_ratio * q;
                            u = b2Math.b2Max(u, Math.abs(r));
                            r = b2Math.b2Clamp(r, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
                            s = -this.m_pulleyMass * r;
                            l = -s * this.m_u1.x;
                            m = -s * this.m_u1.y;
                            n = -this.m_ratio * s * this.m_u2.x;
                            o = -this.m_ratio * s * this.m_u2.y;
                            a.m_position.x += a.m_invMass * l;
                            a.m_position.y += a.m_invMass * m;
                            a.m_rotation += a.m_invI * (h * m - i * l);
                            b.m_position.x += b.m_invMass * n;
                            b.m_position.y += b.m_invMass * o;
                            b.m_rotation += b.m_invI * (j * o - k * n);
                            a.m_R.Set(a.m_rotation);
                            b.m_R.Set(b.m_rotation)
                        }
                        if (this.m_limitState1 == b2Joint.e_atUpperLimit) {
                            c = a.m_R;
                            h = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                            i = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                            l = a.m_position.x + h;
                            m = a.m_position.y + i;
                            this.m_u1.Set(l - d, m - e);
                            p = this.m_u1.Length();
                            if (p > b2Settings.b2_linearSlop) {
                                this.m_u1.x *= 1 / p;
                                this.m_u1.y *= 1 / p
                            } else {
                                this.m_u1.SetZero()
                            }
                            r = this.m_maxLength1 - p;
                            u = b2Math.b2Max(u, -r);
                            r = b2Math.b2Clamp(r + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
                            s = -this.m_limitMass1 * r;
                            t = this.m_limitPositionImpulse1;
                            this.m_limitPositionImpulse1 = b2Math.b2Max(0, this.m_limitPositionImpulse1 + s);
                            s = this.m_limitPositionImpulse1 - t;
                            l = -s * this.m_u1.x;
                            m = -s * this.m_u1.y;
                            a.m_position.x += a.m_invMass * l;
                            a.m_position.y += a.m_invMass * m;
                            a.m_rotation += a.m_invI * (h * m - i * l);
                            a.m_R.Set(a.m_rotation)
                        }
                        if (this.m_limitState2 == b2Joint.e_atUpperLimit) {
                            c = b.m_R;
                            j = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                            k = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                            n = b.m_position.x + j;
                            o = b.m_position.y + k;
                            this.m_u2.Set(n - f, o - g);
                            q = this.m_u2.Length();
                            if (q > b2Settings.b2_linearSlop) {
                                this.m_u2.x *= 1 / q;
                                this.m_u2.y *= 1 / q
                            } else {
                                this.m_u2.SetZero()
                            }
                            r = this.m_maxLength2 - q;
                            u = b2Math.b2Max(u, -r);
                            r = b2Math.b2Clamp(r + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
                            s = -this.m_limitMass2 * r;
                            t = this.m_limitPositionImpulse2;
                            this.m_limitPositionImpulse2 = b2Math.b2Max(0, this.m_limitPositionImpulse2 + s);
                            s = this.m_limitPositionImpulse2 - t;
                            n = -s * this.m_u2.x;
                            o = -s * this.m_u2.y;
                            b.m_position.x += b.m_invMass * n;
                            b.m_position.y += b.m_invMass * o;
                            b.m_rotation += b.m_invI * (j * o - k * n);
                            b.m_R.Set(b.m_rotation)
                        }
                        return u < b2Settings.b2_linearSlop
                    },
                    m_ground: null,
                    m_groundAnchor1: new b2Vec2,
                    m_groundAnchor2: new b2Vec2,
                    m_localAnchor1: new b2Vec2,
                    m_localAnchor2: new b2Vec2,
                    m_u1: new b2Vec2,
                    m_u2: new b2Vec2,
                    m_constant: null,
                    m_ratio: null,
                    m_maxLength1: null,
                    m_maxLength2: null,
                    m_pulleyMass: null,
                    m_limitMass1: null,
                    m_limitMass2: null,
                    m_pulleyImpulse: null,
                    m_limitImpulse1: null,
                    m_limitImpulse2: null,
                    m_limitPositionImpulse1: null,
                    m_limitPositionImpulse2: null,
                    m_limitState1: 0,
                    m_limitState2: 0
                });
                b2PulleyJoint.b2_minPulleyLength = b2Settings.b2_lengthUnitsPerMeter;
                var b2PulleyJointDef = Class.create();
                Object.extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
                Object.extend(b2PulleyJointDef.prototype, {
                    initialize: function () {
                        this.type = b2Joint.e_unknownJoint;
                        this.userData = null;
                        this.body1 = null;
                        this.body2 = null;
                        this.collideConnected = false;
                        this.groundPoint1 = new b2Vec2;
                        this.groundPoint2 = new b2Vec2;
                        this.anchorPoint1 = new b2Vec2;
                        this.anchorPoint2 = new b2Vec2;
                        this.type = b2Joint.e_pulleyJoint;
                        this.groundPoint1.Set(-1, 1);
                        this.groundPoint2.Set(1, 1);
                        this.anchorPoint1.Set(-1, 0);
                        this.anchorPoint2.Set(1, 0);
                        this.maxLength1 = .5 * b2PulleyJoint.b2_minPulleyLength;
                        this.maxLength2 = .5 * b2PulleyJoint.b2_minPulleyLength;
                        this.ratio = 1;
                        this.collideConnected = true
                    },
                    groundPoint1: new b2Vec2,
                    groundPoint2: new b2Vec2,
                    anchorPoint1: new b2Vec2,
                    anchorPoint2: new b2Vec2,
                    maxLength1: null,
                    maxLength2: null,
                    ratio: null
                });
                var b2RevoluteJoint = Class.create();
                Object.extend(b2RevoluteJoint.prototype, b2Joint.prototype);
                Object.extend(b2RevoluteJoint.prototype, {
                    GetAnchor1: function () {
                        var a = this.m_body1.m_R;
                        return new b2Vec2(this.m_body1.m_position.x + (a.col1.x * this.m_localAnchor1.x + a.col2.x * this.m_localAnchor1.y), this.m_body1.m_position.y + (a.col1.y * this.m_localAnchor1.x + a.col2.y * this.m_localAnchor1.y))
                    },
                    GetAnchor2: function () {
                        var a = this.m_body2.m_R;
                        return new b2Vec2(this.m_body2.m_position.x + (a.col1.x * this.m_localAnchor2.x + a.col2.x * this.m_localAnchor2.y), this.m_body2.m_position.y + (a.col1.y * this.m_localAnchor2.x + a.col2.y * this.m_localAnchor2.y))
                    },
                    GetJointAngle: function () {
                        return this.m_body2.m_rotation - this.m_body1.m_rotation
                    },
                    GetJointSpeed: function () {
                        return this.m_body2.m_angularVelocity - this.m_body1.m_angularVelocity
                    },
                    GetMotorTorque: function (a) {
                        return a * this.m_motorImpulse
                    },
                    SetMotorSpeed: function (a) {
                        this.m_motorSpeed = a
                    },
                    SetMotorTorque: function (a) {
                        this.m_maxMotorTorque = a
                    },
                    GetReactionForce: function (a) {
                        var b = this.m_ptpImpulse.Copy();
                        b.Multiply(a);
                        return b
                    },
                    GetReactionTorque: function (a) {
                        return a * this.m_limitImpulse
                    },
                    initialize: function (a) {
                        this.m_node1 = new b2JointNode;
                        this.m_node2 = new b2JointNode;
                        this.m_type = a.type;
                        this.m_prev = null;
                        this.m_next = null;
                        this.m_body1 = a.body1;
                        this.m_body2 = a.body2;
                        this.m_collideConnected = a.collideConnected;
                        this.m_islandFlag = false;
                        this.m_userData = a.userData;
                        this.K = new b2Mat22;
                        this.K1 = new b2Mat22;
                        this.K2 = new b2Mat22;
                        this.K3 = new b2Mat22;
                        this.m_localAnchor1 = new b2Vec2;
                        this.m_localAnchor2 = new b2Vec2;
                        this.m_ptpImpulse = new b2Vec2;
                        this.m_ptpMass = new b2Mat22;
                        var b;
                        var c;
                        var d;
                        b = this.m_body1.m_R;
                        c = a.anchorPoint.x - this.m_body1.m_position.x;
                        d = a.anchorPoint.y - this.m_body1.m_position.y;
                        this.m_localAnchor1.x = c * b.col1.x + d * b.col1.y;
                        this.m_localAnchor1.y = c * b.col2.x + d * b.col2.y;
                        b = this.m_body2.m_R;
                        c = a.anchorPoint.x - this.m_body2.m_position.x;
                        d = a.anchorPoint.y - this.m_body2.m_position.y;
                        this.m_localAnchor2.x = c * b.col1.x + d * b.col1.y;
                        this.m_localAnchor2.y = c * b.col2.x + d * b.col2.y;
                        this.m_intialAngle = this.m_body2.m_rotation - this.m_body1.m_rotation;
                        this.m_ptpImpulse.Set(0, 0);
                        this.m_motorImpulse = 0;
                        this.m_limitImpulse = 0;
                        this.m_limitPositionImpulse = 0;
                        this.m_lowerAngle = a.lowerAngle;
                        this.m_upperAngle = a.upperAngle;
                        this.m_maxMotorTorque = a.motorTorque;
                        this.m_motorSpeed = a.motorSpeed;
                        this.m_enableLimit = a.enableLimit;
                        this.m_enableMotor = a.enableMotor
                    },
                    K: new b2Mat22,
                    K1: new b2Mat22,
                    K2: new b2Mat22,
                    K3: new b2Mat22,
                    PrepareVelocitySolver: function () {
                        var a = this.m_body1;
                        var b = this.m_body2;
                        var c;
                        c = a.m_R;
                        var d = c.col1.x * this.m_localAnchor1.x + c.col2.x * this.m_localAnchor1.y;
                        var e = c.col1.y * this.m_localAnchor1.x + c.col2.y * this.m_localAnchor1.y;
                        c = b.m_R;
                        var f = c.col1.x * this.m_localAnchor2.x + c.col2.x * this.m_localAnchor2.y;
                        var g = c.col1.y * this.m_localAnchor2.x + c.col2.y * this.m_localAnchor2.y;
                        var h = a.m_invMass;
                        var i = b.m_invMass;
                        var j = a.m_invI;
                        var k = b.m_invI;
                        this.K1.col1.x = h + i;
                        this.K1.col2.x = 0;
                        this.K1.col1.y = 0;
                        this.K1.col2.y = h + i;
                        this.K2.col1.x = j * e * e;
                        this.K2.col2.x = -j * d * e;
                        this.K2.col1.y = -j * d * e;
                        this.K2.col2.y = j * d * d;
                        this.K3.col1.x = k * g * g;
                        this.K3.col2.x = -k * f * g;
                        this.K3.col1.y = -k * f * g;
                        this.K3.col2.y = k * f * f;
                        this.K.SetM(this.K1);
                        this.K.AddM(this.K2);
                        this.K.AddM(this.K3);
                        this.K.Invert(this.m_ptpMass);
                        this.m_motorMass = 1 / (j + k);
                        if (this.m_enableMotor == false) {
                            this.m_motorImpulse = 0
                        }
                        if (this.m_enableLimit) {
                            var l = b.m_rotation - a.m_rotation - this.m_intialAngle;
                            if (b2Math.b2Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * b2Settings.b2_angularSlop) {
                                this.m_limitState = b2Joint.e_equalLimits
                            } else if (l <= this.m_lowerAngle) {
                                if (this.m_limitState != b2Joint.e_atLowerLimit) {
                                    this.m_limitImpulse = 0
                                }
                                this.m_limitState = b2Joint.e_atLowerLimit
                            } else if (l >= this.m_upperAngle) {
                                if (this.m_limitState != b2Joint.e_atUpperLimit) {
                                    this.m_limitImpulse = 0
                                }
                                this.m_limitState = b2Joint.e_atUpperLimit
                            } else {
                                this.m_limitState = b2Joint.e_inactiveLimit;
                                this.m_limitImpulse = 0
                            }
                        } else {
                            this.m_limitImpulse = 0
                        }
                        if (b2World.s_enableWarmStarting) {
                            a.m_linearVelocity.x -= h * this.m_ptpImpulse.x;
                            a.m_linearVelocity.y -= h * this.m_ptpImpulse.y;
                            a.m_angularVelocity -= j * (d * this.m_ptpImpulse.y - e * this.m_ptpImpulse.x + this.m_motorImpulse + this.m_limitImpulse);
                            b.m_linearVelocity.x += i * this.m_ptpImpulse.x;
                            b.m_linearVelocity.y += i * this.m_ptpImpulse.y;
                            b.m_angularVelocity += k * (f * this.m_ptpImpulse.y - g * this.m_ptpImpulse.x + this.m_motorImpulse + this.m_limitImpulse)
                        } else {
                            this.m_ptpImpulse.SetZero();
                            this.m_motorImpulse = 0;
                            this.m_limitImpulse = 0
                        }
                        this.m_limitPositionImpulse = 0
                    },
                    SolveVelocityConstraints: function (a) {
                        var b = this.m_body1;
                        var c = this.m_body2;
                        var d;
                        d = b.m_R;
                        var e = d.col1.x * this.m_localAnchor1.x + d.col2.x * this.m_localAnchor1.y;
                        var f = d.col1.y * this.m_localAnchor1.x + d.col2.y * this.m_localAnchor1.y;
                        d = c.m_R;
                        var g = d.col1.x * this.m_localAnchor2.x + d.col2.x * this.m_localAnchor2.y;
                        var h = d.col1.y * this.m_localAnchor2.x + d.col2.y * this.m_localAnchor2.y;
                        var i;
                        var j = c.m_linearVelocity.x + -c.m_angularVelocity * h - b.m_linearVelocity.x - -b.m_angularVelocity * f;
                        var k = c.m_linearVelocity.y + c.m_angularVelocity * g - b.m_linearVelocity.y - b.m_angularVelocity * e;
                        var l = -(this.m_ptpMass.col1.x * j + this.m_ptpMass.col2.x * k);
                        var m = -(this.m_ptpMass.col1.y * j + this.m_ptpMass.col2.y * k);
                        this.m_ptpImpulse.x += l;
                        this.m_ptpImpulse.y += m;
                        b.m_linearVelocity.x -= b.m_invMass * l;
                        b.m_linearVelocity.y -= b.m_invMass * m;
                        b.m_angularVelocity -= b.m_invI * (e * m - f * l);
                        c.m_linearVelocity.x += c.m_invMass * l;
                        c.m_linearVelocity.y += c.m_invMass * m;
                        c.m_angularVelocity += c.m_invI * (g * m - h * l);
                        if (this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
                            var n = c.m_angularVelocity - b.m_angularVelocity - this.m_motorSpeed;
                            var o = -this.m_motorMass * n;
                            var p = this.m_motorImpulse;
                            this.m_motorImpulse = b2Math.b2Clamp(this.m_motorImpulse + o, -a.dt * this.m_maxMotorTorque, a.dt * this.m_maxMotorTorque);
                            o = this.m_motorImpulse - p;
                            b.m_angularVelocity -= b.m_invI * o;
                            c.m_angularVelocity += c.m_invI * o
                        }
                        if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
                            var q = c.m_angularVelocity - b.m_angularVelocity;
                            var r = -this.m_motorMass * q;
                            if (this.m_limitState == b2Joint.e_equalLimits) {
                                this.m_limitImpulse += r
                            } else if (this.m_limitState == b2Joint.e_atLowerLimit) {
                                i = this.m_limitImpulse;
                                this.m_limitImpulse = b2Math.b2Max(this.m_limitImpulse + r, 0);
                                r = this.m_limitImpulse - i
                            } else if (this.m_limitState == b2Joint.e_atUpperLimit) {
                                i = this.m_limitImpulse;
                                this.m_limitImpulse = b2Math.b2Min(this.m_limitImpulse + r, 0);
                                r = this.m_limitImpulse - i
                            }
                            b.m_angularVelocity -= b.m_invI * r;
                            c.m_angularVelocity += c.m_invI * r
                        }
                    },
                    SolvePositionConstraints: function () {
                        var a;
                        var b;
                        var c = this.m_body1;
                        var d = this.m_body2;
                        var e = 0;
                        var f;
                        f = c.m_R;
                        var g = f.col1.x * this.m_localAnchor1.x + f.col2.x * this.m_localAnchor1.y;
                        var h = f.col1.y * this.m_localAnchor1.x + f.col2.y * this.m_localAnchor1.y;
                        f = d.m_R;
                        var i = f.col1.x * this.m_localAnchor2.x + f.col2.x * this.m_localAnchor2.y;
                        var j = f.col1.y * this.m_localAnchor2.x + f.col2.y * this.m_localAnchor2.y;
                        var k = c.m_position.x + g;
                        var l = c.m_position.y + h;
                        var m = d.m_position.x + i;
                        var n = d.m_position.y + j;
                        var o = m - k;
                        var p = n - l;
                        e = Math.sqrt(o * o + p * p);
                        var q = c.m_invMass;
                        var r = d.m_invMass;
                        var s = c.m_invI;
                        var t = d.m_invI;
                        this.K1.col1.x = q + r;
                        this.K1.col2.x = 0;
                        this.K1.col1.y = 0;
                        this.K1.col2.y = q + r;
                        this.K2.col1.x = s * h * h;
                        this.K2.col2.x = -s * g * h;
                        this.K2.col1.y = -s * g * h;
                        this.K2.col2.y = s * g * g;
                        this.K3.col1.x = t * j * j;
                        this.K3.col2.x = -t * i * j;
                        this.K3.col1.y = -t * i * j;
                        this.K3.col2.y = t * i * i;
                        this.K.SetM(this.K1);
                        this.K.AddM(this.K2);
                        this.K.AddM(this.K3);
                        this.K.Solve(b2RevoluteJoint.tImpulse, -o, -p);
                        var u = b2RevoluteJoint.tImpulse.x;
                        var v = b2RevoluteJoint.tImpulse.y;
                        c.m_position.x -= c.m_invMass * u;
                        c.m_position.y -= c.m_invMass * v;
                        c.m_rotation -= c.m_invI * (g * v - h * u);
                        c.m_R.Set(c.m_rotation);
                        d.m_position.x += d.m_invMass * u;
                        d.m_position.y += d.m_invMass * v;
                        d.m_rotation += d.m_invI * (i * v - j * u);
                        d.m_R.Set(d.m_rotation);
                        var w = 0;
                        if (this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
                            var x = d.m_rotation - c.m_rotation - this.m_intialAngle;
                            var y = 0;
                            if (this.m_limitState == b2Joint.e_equalLimits) {
                                b = b2Math.b2Clamp(x, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
                                y = -this.m_motorMass * b;
                                w = b2Math.b2Abs(b)
                            } else if (this.m_limitState == b2Joint.e_atLowerLimit) {
                                b = x - this.m_lowerAngle;
                                w = b2Math.b2Max(0, -b);
                                b = b2Math.b2Clamp(b + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0);
                                y = -this.m_motorMass * b;
                                a = this.m_limitPositionImpulse;
                                this.m_limitPositionImpulse = b2Math.b2Max(this.m_limitPositionImpulse + y, 0);
                                y = this.m_limitPositionImpulse - a
                            } else if (this.m_limitState == b2Joint.e_atUpperLimit) {
                                b = x - this.m_upperAngle;
                                w = b2Math.b2Max(0, b);
                                b = b2Math.b2Clamp(b - b2Settings.b2_angularSlop, 0, b2Settings.b2_maxAngularCorrection);
                                y = -this.m_motorMass * b;
                                a = this.m_limitPositionImpulse;
                                this.m_limitPositionImpulse = b2Math.b2Min(this.m_limitPositionImpulse + y, 0);
                                y = this.m_limitPositionImpulse - a
                            }
                            c.m_rotation -= c.m_invI * y;
                            c.m_R.Set(c.m_rotation);
                            d.m_rotation += d.m_invI * y;
                            d.m_R.Set(d.m_rotation)
                        }
                        return e <= b2Settings.b2_linearSlop && w <= b2Settings.b2_angularSlop
                    },
                    m_localAnchor1: new b2Vec2,
                    m_localAnchor2: new b2Vec2,
                    m_ptpImpulse: new b2Vec2,
                    m_motorImpulse: null,
                    m_limitImpulse: null,
                    m_limitPositionImpulse: null,
                    m_ptpMass: new b2Mat22,
                    m_motorMass: null,
                    m_intialAngle: null,
                    m_lowerAngle: null,
                    m_upperAngle: null,
                    m_maxMotorTorque: null,
                    m_motorSpeed: null,
                    m_enableLimit: null,
                    m_enableMotor: null,
                    m_limitState: 0
                });
                b2RevoluteJoint.tImpulse = new b2Vec2;
                var b2RevoluteJointDef = Class.create();
                Object.extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
                Object.extend(b2RevoluteJointDef.prototype, {
                    initialize: function () {
                        this.type = b2Joint.e_unknownJoint;
                        this.userData = null;
                        this.body1 = null;
                        this.body2 = null;
                        this.collideConnected = false;
                        this.type = b2Joint.e_revoluteJoint;
                        this.anchorPoint = new b2Vec2(0, 0);
                        this.lowerAngle = 0;
                        this.upperAngle = 0;
                        this.motorTorque = 0;
                        this.motorSpeed = 0;
                        this.enableLimit = false;
                        this.enableMotor = false
                    },
                    anchorPoint: null,
                    lowerAngle: null,
                    upperAngle: null,
                    motorTorque: null,
                    motorSpeed: null,
                    enableLimit: null,
                    enableMotor: null
                })


                /*------------------------------------*\
                 WORKERS
                 \*------------------------------------*/

// variables
                var canvas, worldAABB, world, mouseJoint;

                var delta = [0, 0];
                var stage = [window.screenX, window.screenY, window.innerWidth, window.innerHeight];
                var isRunning = false;
                var isMouseDown = false;
                var iterations = 1;
                var timeStep = 1 / 25;
                var walls = new Array();
                var wall_thickness = 200;
                var wallsSetted = false;
                var mouseX = 0;
                var mouseY = 0;
                var mouseOnClick = new Array();
                var timer = 0;
                var elements = new Array();
                var bodies = new Array();
                var properties = new Array();
                var orientation = {x: 0, y: 1};

// get browser dimensions
                getBrowserDimensions();

// initialise
                init();


                /*------------------------------------*\
                 FUNCTIONS
                 \*------------------------------------*/

// init()
                function init() {
                    canvas = document.getElementById('canvas');

                    document.onmousedown = onDocumentMouseDown;
                    document.onmouseup = onDocumentMouseUp;
                    document.onmousemove = onDocumentMouseMove;

                    // init box2d
                    worldAABB = new b2AABB();
                    worldAABB.minVertex.Set(-200, -200);
                    worldAABB.maxVertex.Set(screen.width + 200, screen.height + 200);

                    world = new b2World(worldAABB, new b2Vec2(0, 0), true);

                    // walls
                    setWalls();

                    // Get box2d elements
                    elements = $('.box2d');

                    for (i = 0; i < elements.length; i++) {

                        var element = elements[i];
                        properties[i] = findPos(element);
                        properties[i][2] = element.offsetWidth;
                        properties[i][3] = element.offsetHeight;
                    }

                    for (i = 0; i < elements.length; i++) {
                        var element = elements[i];
                        element.style.position = 'absolute';
                        element.style.left = properties[i][0] + 'px';
                        element.style.top = properties[i][1] + 'px';

                        element.onmousedown = onElementMouseDown;
                        element.onmouseup = onElementMouseUp;

                        bodies[i] = createBox(world, properties[i][0] + (properties[i][2] >> 1), properties[i][1] + (properties[i][3] >> 1), properties[i][2] / 2, properties[i][3] / 2, false);
                    }
                }

// run()
                function run() {
                    isRunning = true;
                    setInterval(loop, o.weight); // weight setting
                }

// onDocumentMouseDown() - Used to detect mouse on elements to move
                function onDocumentMouseDown() {
                    isMouseDown = true;
                    return false;
                }

// onDocumentMouseUp()
                function onDocumentMouseUp() {
                    isMouseDown = false;
                    return false;
                }

// onDocumentMouseMove()
                function onDocumentMouseMove(e) {
                    if (!isRunning) {
                        run();
                        if (jQuery.isFunction(o.callback)) {
                            o.callback();
                        }
                    }
                    if (!e) {
                        e = window.event;
                    }
                    mouseX = e.clientX + $(window).scrollLeft();
                    mouseY = e.clientY + $(window).scrollTop();
                }

// onElementMouseDown()
                function onElementMouseDown(e) {
                    if (!e) {
                        e = window.event;
                    }
                    mouseOnClick[0] = e.clientX + $(window).scrollLeft();
                    mouseOnClick[1] = e.clientY + $(window).scrollTop();
                    return false;
                }

// onElementMouseUp()
                function onElementMouseUp() {
                    return false;
                }


// loop()
                function loop() {

                    if (getBrowserDimensions())
                        setWalls();

                    delta[0] += (0 - delta[0]) * .5;
                    delta[1] += (0 - delta[1]) * .5;

                    world.m_gravity.x = orientation.x * 350 + delta[0];
                    world.m_gravity.y = orientation.y * 350 + delta[1];

                    mouseDrag();
                    world.Step(timeStep, iterations);

                    for (i = 0; i < elements.length; i++) {

                        var body = bodies[i];
                        var element = elements[i];

                        element.style.left = (body.m_position0.x - (properties[i][2] >> 1)) + 'px';
                        element.style.top = (body.m_position0.y - (properties[i][3] >> 1)) + 'px';

                        var rotationStyle = 'rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)';

                        element.style.WebkitTransform = rotationStyle;
                        element.style.MozTransform = rotationStyle;
                        element.style.OTransform = rotationStyle;
                    }
                }

// createBox()
                function createBox(world, x, y, width, height, fixed, element) {

                    if (typeof(fixed) == 'undefined')
                        fixed = true;

                    var boxSd = new b2BoxDef();

                    if (!fixed)
                        boxSd.density = 1.0;

                    boxSd.extents.Set(width, height);

                    var boxBd = new b2BodyDef();
                    boxBd.AddShape(boxSd);
                    boxBd.position.Set(x, y);
                    boxBd.userData = {element: element};

                    return world.CreateBody(boxBd)
                }

// mouseDrag()
                function mouseDrag() {

                    if (o.drag == true) {
                        // mouse press
                        if (isMouseDown && !mouseJoint) {

                            var body = getBodyAtMouse();

                            if (body) {
                                var md = new b2MouseJointDef();
                                md.body1 = world.m_groundBody;
                                md.body2 = body;
                                md.target.Set(mouseX, mouseY);
                                md.maxForce = 30000.0 * body.m_mass;
                                md.timeStep = timeStep;
                                mouseJoint = world.CreateJoint(md);
                                body.WakeUp();
                            }
                        }

                        // mouse release
                        if (!isMouseDown) {
                            if (mouseJoint) {
                                world.DestroyJoint(mouseJoint);
                                mouseJoint = null;
                            }
                        }

                        // mouse move
                        if (mouseJoint) {
                            var p2 = new b2Vec2(mouseX, mouseY);
                            mouseJoint.SetTarget(p2);
                        }
                    }

                }

// getBodyAtMouse()
                function getBodyAtMouse() {

                    // Make a small box.
                    var mousePVec = new b2Vec2();
                    mousePVec.Set(mouseX, mouseY);

                    var aabb = new b2AABB();
                    aabb.minVertex.Set(mouseX - 1, mouseY - 1);
                    aabb.maxVertex.Set(mouseX + 1, mouseY + 1);

                    // Query the world for overlapping shapes.
                    var k_maxCount = 10;
                    var shapes = new Array();
                    var count = world.Query(aabb, shapes, k_maxCount);
                    var body = null;

                    for (var i = 0; i < count; ++i) {

                        if (shapes[i].m_body.IsStatic() == false) {

                            if (shapes[i].TestPoint(mousePVec)) {

                                body = shapes[i].m_body;
                                break;
                            }
                        }
                    }

                    return body;
                }

// setWalls()
                function setWalls() {

                    if (wallsSetted) {

                        world.DestroyBody(walls[0]);
                        world.DestroyBody(walls[1]);
                        world.DestroyBody(walls[2]);
                        world.DestroyBody(walls[3]);

                        walls[0] = null;
                        walls[1] = null;
                        walls[2] = null;
                        walls[3] = null;
                    }

                    walls[0] = createBox(world, stage[2] / 2, -wall_thickness, stage[2], wall_thickness);
                    walls[1] = createBox(world, stage[2] / 2, stage[3] + wall_thickness, stage[2], wall_thickness);
                    walls[2] = createBox(world, -wall_thickness, stage[3] / 2, wall_thickness, stage[3]);
                    walls[3] = createBox(world, stage[2] + wall_thickness, stage[3] / 2, wall_thickness, stage[3]);

                    wallsSetted = true;
                }

// findPos()
                function findPos(obj) {
                    var curleft = curtop = 0;

                    if (obj.offsetParent) {
                        do {

                            curleft += obj.offsetLeft;
                            curtop += obj.offsetTop;

                        } while (obj = obj.offsetParent);
                    }

                    return [curleft, curtop];
                }

// getBrowserDimensions()
                function getBrowserDimensions() {
                    var changed = false;

                    if (stage[0] != window.screenX) {
                        delta[0] = (window.screenX - stage[0]) * 50;
                        stage[0] = window.screenX;
                        changed = true;
                    }

                    if (stage[1] != window.screenY) {
                        delta[1] = (window.screenY - stage[1]) * 50;
                        stage[1] = window.screenY;
                        changed = true;
                    }

                    if (stage[2] != window.innerWidth) {
                        stage[2] = window.innerWidth;
                        changed = true;
                    }

                    if (stage[3] != window.innerHeight) {
                        stage[3] = window.innerHeight;
                        changed = true;
                    }

                    return changed;
                }


// jQuery plugin end
            });
        }
    });
})(jQuery);