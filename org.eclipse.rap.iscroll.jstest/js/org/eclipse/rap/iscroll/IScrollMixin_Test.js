﻿/*******************************************************************************
 * Copyright (c) 2012, 2013 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

org.eclipse.rap.iscroll.IScrollSupport.activate();

(function(){

var TestUtil = org.eclipse.rwt.test.fixture.TestUtil;
var IScroll = org.eclipse.rap.iscroll.IScroll;
var IScrollTestUtil = org.eclipse.rap.iscroll.IScrollTestUtil;

var touch = org.eclipse.rap.iscroll.IScrollTestUtil.touch;

var shell;
var scrollable;
var clientArea;
var content;

rwt.qx.Class.define( "org.eclipse.rap.iscroll.IScrollMixin_Test", {

  extend : rwt.qx.Object,

  members : {

    testCreateIScroll: function() {
      assertTrue( scrollable.getIScroll() instanceof IScroll );
    },

    testIScrollElements : function() {
      assertIdentical( clientArea.getElement(), scrollable.getIScroll().wrapper );
      assertIdentical( clientArea._getTargetNode(), scrollable.getIScroll().scroller );
    },

    testDestroy : function() {
      var iscroll = scrollable.getIScroll();

      scrollable.destroy();
      TestUtil.flush();

      assertTrue( scrollable.isDisposed() );
      assertNull( scrollable.getIScroll() );
      assertNull( iscroll.scroller );
      assertNull( iscroll.wrapper );
    },

    testNoOverflow : function() {
      assertEquals( "hidden", clientArea.getOverflow() );
    },

    testIScrollMaxScroll : function() {
      // Note: scrollable ( 100 ) - scrollbar( 10 ) - content (1000) = -910
      assertEquals( -910, scrollable.getIScroll().maxScrollX );
      assertEquals( -910, scrollable.getIScroll().maxScrollY );
    },

    testIScrollMaxScrollChangedByContent : function() {
      content.setWidth( 500 );
      content.setHeight( 1500 );
      TestUtil.flush();
      TestUtil.forceTimerOnce();

      assertEquals( -410, scrollable.getIScroll().maxScrollX );
      assertEquals( -1410, scrollable.getIScroll().maxScrollY );
    },

    testIScrollMaxScrollChangedByScrollable : function() {
      scrollable.setWidth( 50 );
      scrollable.setHeight( 300 );
      TestUtil.flush();

      assertEquals( -960, scrollable.getIScroll().maxScrollX );
      assertEquals( -710, scrollable.getIScroll().maxScrollY );
    },

    testIScrollScrollerSizeChangedByContent : function() {
      content.setWidth( 500 );
      content.setHeight( 1500 );
      TestUtil.flush();
      TestUtil.forceTimerOnce();

      assertEquals( 500, scrollable.getIScroll().scrollerW );
      assertEquals( 1500, scrollable.getIScroll().scrollerH );
    },

    testSetScrollbarSelection : function() {
      scrollable.setHBarSelection( 100 );
      scrollable.setVBarSelection( 200 );

      assertEquals( -100, scrollable.getIScroll().x );
      assertEquals( -200, scrollable.getIScroll().y );
    },

    testGetScrollPosition : function() {
      scrollable.getIScroll().setScrollPosition( -40, -10 );

      assertEquals( 40, clientArea.getScrollLeft() );
      assertEquals( 10, clientArea.getScrollTop() );
    },

    testGetScrollPositionNegative : function() {
      // iScroll can have out of bounds scroll positions when "bouncing"
      scrollable.getIScroll().setScrollPosition( 40, 10 );

      assertEquals( 40, scrollable.getIScroll().x );
      assertEquals( 10, scrollable.getIScroll().y );
      assertEquals( 0, clientArea.getScrollLeft() );
      assertEquals( 0, clientArea.getScrollTop() );
    },

    testGetScrollPositionOverMax : function() {
      scrollable.getIScroll().setScrollPosition( -950, -950 );

      assertEquals( -950, scrollable.getIScroll().x );
      assertEquals( -950, scrollable.getIScroll().y );
      assertEquals( 910, clientArea.getScrollLeft() );
      assertEquals( 910, clientArea.getScrollTop() );
    },

    testUserScrollEvents : function() {
      var log = [];
      scrollable.addEventListener( "userScroll", function(){
        log.push( IScrollTestUtil.getScrollBarValues( scrollable ) );
      }, this );
      var iscroll = scrollable.getIScroll();

      touch( "start", iscroll, [ 100, 100 ] );
      touch( "move", iscroll, [ 90, 90 ] );
      touch( "move", iscroll, [ 60, 90 ] );
      touch( "end", iscroll, [ 60, 90 ] );

      assertEquals( 3, log.length );
      assertEquals( [ 10, 10 ], log[ 1 ] );
      assertEquals( [ 40, 10 ], log[ 2 ] );
    },

    // NOTE: This tests for a bug that caused an alert error to appear.
    // Since errors in MobileWebkitSupport are currently caught
    // and not re-thrown (see MobileWebkitSupport#_onTouchEvent), the error might appear
    // but the test will still be (falsely) green.
    testUserScrollEventsAfterTouchEnd : function() {
      var log = [];
      scrollable.addEventListener( "userScroll", function(){
        log.push( IScrollTestUtil.getScrollBarValues( scrollable ) );
      }, this );
      var iscroll = scrollable.getIScroll();
      var element = iscroll.scroller;

      touch( "start", iscroll, [ 100, 100 ], element, 1 );
      touch( "start", iscroll, [ 100, 90 ], element, 2 );
      touch( "end", iscroll, [ 100, 90 ], element, 1 );
      touch( "move", iscroll, [ 90, 90 ], element, 1 );
      touch( "end", iscroll, [ 60, 90 ], element, 0 );

      assertEquals( 1, log.length );
    },

    testMovePreventDefault : function() {
      var log = [];
      var iscroll = scrollable.getIScroll();

      log.push( touch( "start", iscroll, [ 100, 100 ] ) );
      log.push( touch( "move", iscroll, [ 90, 90 ] ) );
      log.push( touch( "move", iscroll, [ 60, 90 ] ) );
      log.push( touch( "end", iscroll, [ 60, 90 ] ) );

      assertEquals( [ false, true, true, false ], log );
    },

    testReleaseBlockScrolling : function() {
      var log = [];
      scrollable.addEventListener( "userScroll", function(){
        log.push( IScrollTestUtil.getScrollBarValues( scrollable ) );
      }, this );
      var iscroll = scrollable.getIScroll();
      scrollable.setBlockScrolling( true );

      touch( "start", iscroll, [ 100, 100 ] );
      touch( "move", iscroll, [ 90, 90 ] );
      touch( "move", iscroll, [ 60, 90 ] );
      touch( "end", iscroll, [ 60, 90 ] );

      assertEquals( 3, log.length );
      assertEquals( [ 10, 10 ], log[ 1 ] );
      assertEquals( [ 40, 10 ], log[ 2 ] );
    },

    testDisableOuterIScroll : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();

      log.push( iscroll.enabled );
      touch( "start", innerIscroll, [ 100, 100 ] );
      touch( "start", iscroll, [ 100, 100 ] );
      log.push( iscroll.enabled );
      touch( "move", innerIscroll, [ 90, 90 ] );
      log.push( iscroll.enabled );
      touch( "end", innerIscroll, [ 90, 90 ] );
      log.push( iscroll.enabled );

      assertEquals( [ true, false, false, true ], log );
    },

    testEnableInnerIScroll : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      var innerIscroll = innerScrollable.getIScroll();
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 100, 100 ] );
      touch( "start", iscroll, [ 100, 100 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 90] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDisableInnerIScroll : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();
      iscroll.setScrollPosition( -20, -20 );

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 100, 100 ] );
      log.push( innerIscroll.enabled );
      touch( "end", iscroll, [ 100, 100 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, false, true ], log );
    },

    testEnableOuterIScroll : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();
      iscroll.setScrollPosition( -20, -20 );

      log.push( iscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( iscroll.enabled );
      touch( "move", innerIscroll, [ 100, 100 ] );
      log.push( iscroll.enabled );
      touch( "end", iscroll, [ 100, 100 ] );
      log.push( iscroll.enabled );

      assertEquals( [ true, false, true, true ], log );
    },

    testEnableOuterIScrollOnInnerNotScrollableY : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();
      innerScrollable.setScrollBarsVisible( true, false );

      iscroll.setScrollPosition( -20, -20 );

      log.push( iscroll.enabled );
      touch( "start", innerIscroll, [ 100, 100 ] );
      touch( "start", iscroll, [ 100, 100 ] );
      log.push( iscroll.enabled );
      touch( "move", innerIscroll, [ 100, 90 ] );
      log.push( iscroll.enabled );
      touch( "end", iscroll, [ 100, 90 ] );
      log.push( iscroll.enabled );

      assertEquals( [ true, false, true, true ], log );
    },

    testEnableOuterIScrollOnInnerNotScrollableX : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();
      innerScrollable.setScrollBarsVisible( false, true );

      iscroll.setScrollPosition( -20, -20 );

      log.push( iscroll.enabled );
      touch( "start", innerIscroll, [ 100, 100 ] );
      touch( "start", iscroll, [ 100, 100 ] );
      log.push( iscroll.enabled );
      touch( "move", innerIscroll, [ 90, 100 ] );
      log.push( iscroll.enabled );
      touch( "end", iscroll, [ 90, 100 ] );
      log.push( iscroll.enabled );

      assertEquals( [ true, false, true, true ], log );
    },

    testScrollOuterYMin : function() {
      var innerScrollable = this._createInnerScrollable();
      scrollable.getIScroll().setScrollPosition( -30, -40 );
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();

      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      touch( "move", innerIscroll, [ 90, 91 ] );
      touch( "move", iscroll, [ 90, 121 ] );
      touch( "end", iscroll, [ 90, 121 ] );

      assertEquals( 0, innerScrollable.getIScroll().y );
      assertEquals( -10, scrollable.getIScroll().y );
    },

    testScrollOuterXMin : function() {
      var innerScrollable = this._createInnerScrollable();
      scrollable.getIScroll().setScrollPosition( -40, -30 );
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();

      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      touch( "move", innerIscroll, [ 91, 90 ] );
      touch( "move", iscroll, [ 121, 90 ] );
      touch( "end", iscroll, [ 121, 90 ] );

      assertEquals( 0, innerScrollable.getIScroll().x );
      assertEquals( -10, scrollable.getIScroll().x );
    },

    testScrollOuterYMax : function() {
      var innerScrollable = this._createInnerScrollable();
      scrollable.getIScroll().setScrollPosition( -30, -30 );
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();
      innerIscroll.setScrollPosition( -910, -910 );

      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      touch( "move", innerIscroll, [ 90, 89 ] );
      touch( "move", iscroll, [ 90, 79 ] );
      touch( "end", iscroll, [ 90, 79 ] );

      assertEquals( -910, innerScrollable.getIScroll().y );
      assertEquals( -40, scrollable.getIScroll().y );
    },

    testScrollOuterXMax : function() {
      var innerScrollable = this._createInnerScrollable();
      scrollable.getIScroll().setScrollPosition( -30, -30 );
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();
      innerIscroll.setScrollPosition( -910, -910 );

      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      touch( "move", innerIscroll, [ 89, 90 ] );
      touch( "move", iscroll, [ 79, 90 ] );
      touch( "end", iscroll, [ 79, 90 ] );

      assertEquals( -910, innerScrollable.getIScroll().x );
      assertEquals( -40, scrollable.getIScroll().x );
    },

    testDontDisableInnerIScrollYWhenOuterNotScrollableY : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      content.setHeight( 90 );
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 100 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 100 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDontDisableInnerIScrollXWhenOuterNotScrollableX : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      content.setWidth( 90 );
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 100, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 100, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDontDisableInnerIScrollYWhenOuterAtMin : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 100 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 100 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDontDisableInnerIScrollXWhenOuterAtMin : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 100, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 100, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDontDisableInnerIScrollYWhenOuterAtMax : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      innerScrollable.getIScroll().setScrollPosition( -910, -910 );
      scrollable.getIScroll().setScrollPosition( -910, -910 );
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 80 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 80 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDontDisableInnerIScrollXWhenOuterAtMax : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      innerScrollable.getIScroll().setScrollPosition( -910, -910 );
      scrollable.getIScroll().setScrollPosition( -910, -910 );
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 80, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 80, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
    },

    testDontDisableInnerIScrollYWhenAlreadyScrolledOtherDirection : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      scrollable.getIScroll().setScrollPosition( -20, -20 );
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 80 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 100 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 100 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true, true ], log );
    },

    testDontDisableInnerIScrollYWhenAlreadyScrolledSameDirectionYMin : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      innerIscroll.setScrollPosition( 0, -2 );
      scrollable.getIScroll().setScrollPosition( -20, -20 );
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 80 ] );
      touch( "start", iscroll, [ 90, 80 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
      assertEquals( [ 0, 0 ], IScrollTestUtil.getScrollBarValues( innerScrollable ) );
      assertEquals( [ 20, 20 ], IScrollTestUtil.getScrollBarValues( scrollable ) );
    },

    testDontDisableInnerIScrollYWhenAlreadyScrolledSameDirectionYMax : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      innerIscroll.setScrollPosition( 0, -908 );
      var iscroll = scrollable.getIScroll();
      iscroll.setScrollPosition( -20, -20 );

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 80 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 80 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
      assertEquals( [ 0, 910 ], IScrollTestUtil.getScrollBarValues( innerScrollable ) );
      assertEquals( [ 20, 20 ], IScrollTestUtil.getScrollBarValues( scrollable ) );
    },

    testDontDisableInnerIScrollXWhenAlreadyScrolledSameDirectionXMin : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      innerIscroll.setScrollPosition( -2, 0 );
      scrollable.getIScroll().setScrollPosition( -20, -20 );
      var iscroll = scrollable.getIScroll();

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 80, 90 ] );
      touch( "start", iscroll, [ 80, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
      assertEquals( [ 0, 0 ], IScrollTestUtil.getScrollBarValues( innerScrollable ) );
      assertEquals( [ 20, 20 ], IScrollTestUtil.getScrollBarValues( scrollable ) );
    },

    testDontDisableInnerIScrollXWhenAlreadyScrolledSameDirectionXMax : function() {
      var log = [];
      var innerScrollable = this._createInnerScrollable();
      TestUtil.flush();
      var innerIscroll = innerScrollable.getIScroll();
      innerIscroll.setScrollPosition( -908, 0 );
      var iscroll = scrollable.getIScroll();
      iscroll.setScrollPosition( -20, -20 );

      log.push( innerIscroll.enabled );
      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "start", iscroll, [ 90, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "move", innerIscroll, [ 80, 90 ] );
      log.push( innerIscroll.enabled );
      touch( "end", innerIscroll, [ 80, 90 ] );
      log.push( innerIscroll.enabled );

      assertEquals( [ true, true, true, true ], log );
      assertEquals( [ 910, 0 ], IScrollTestUtil.getScrollBarValues( innerScrollable ) );
      assertEquals( [ 20, 20 ], IScrollTestUtil.getScrollBarValues( scrollable ) );
    },

    testResetOnDisable : function() {
      var innerScrollable = this._createInnerScrollable();
      scrollable.getIScroll().setScrollPosition( -30, -40 );
      var iscroll = scrollable.getIScroll();
      var innerIscroll = innerScrollable.getIScroll();

      touch( "start", innerIscroll, [ 90, 90 ] );
      touch( "move", innerIscroll, [ 90, 121 ] ); //starts scrolling only after a certain distance
      touch( "end", iscroll, [ 90, 121 ] );

      assertEquals( 0, innerScrollable.getIScroll().y );
    },

    /////////
    // Helper

    setUp : function() {
      shell = TestUtil.createShellByProtocol( "w2" );
      scrollable = IScrollTestUtil.createScrolledComposite();
      clientArea = scrollable.getClientAreaWidget();
      content = clientArea.getFirstChild();
      TestUtil.flush();
    },

    tearDown : function() {
      shell.destroy();
      shell = null;
      scrollable = null;
      content = null;
      clientArea = null;
    },

    _createInnerScrollable : function() {
      var result = IScrollTestUtil.createChildScrolledComposite();
      TestUtil.flush();
      return result;
    }

  }

} );

}());
