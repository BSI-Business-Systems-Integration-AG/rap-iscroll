/*******************************************************************************
 * Copyright (c) 2012, 2013 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

package org.eclipse.rap.iscroll.demo;

import org.eclipse.rap.iscroll.IScroll;
import org.eclipse.rap.rwt.application.EntryPoint;
import org.eclipse.swt.SWT;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.events.MouseEvent;
import org.eclipse.swt.events.MouseListener;
import org.eclipse.swt.events.SelectionAdapter;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.layout.GridData;
import org.eclipse.swt.layout.GridLayout;
import org.eclipse.swt.widgets.Button;
import org.eclipse.swt.widgets.Composite;
import org.eclipse.swt.widgets.Display;
import org.eclipse.swt.widgets.Label;
import org.eclipse.swt.widgets.List;
import org.eclipse.swt.widgets.MessageBox;
import org.eclipse.swt.widgets.Shell;
import org.eclipse.swt.widgets.Table;
import org.eclipse.swt.widgets.TableItem;
import org.eclipse.swt.widgets.Text;

public class IScrollDemo implements EntryPoint {

  public int createUI() {
    Display display = new Display();
    IScroll.activate();
    Shell shell = new Shell( display, SWT.NONE );
    shell.setLayout( new GridLayout( 3, true ) );
    shell.setFullScreen( true );
    createList( shell );
    createTable( shell );
    createScrolledComposite( shell );
    shell.open();
    while( !shell.isDisposed() ) {
      if( !display.readAndDispatch() ) {
        display.sleep();
      }
    }
    display.dispose();
    return 0;
  }

  private static List createList( Composite parent ) {
    List list = new List( parent, SWT.BORDER | SWT.V_SCROLL );
    list.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, true ) );
    for( int i = 0; i < 50; i++ ) {
      list.add( "ListItem " + i );
    }
    return list;
  }

  private static Table createTable( Composite parent ) {
    Table table = new Table( parent, SWT.BORDER | SWT.FULL_SELECTION );
    table.setLinesVisible( true );
    table.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, true ) );
    for( int i = 0; i < 50; i++ ) {
      new TableItem( table, SWT.NONE ).setText( "TableItem " + i );
    }
    return table;
  }

  private static Composite createMiniScrolledComposite( Composite parent ) {
    final ScrolledComposite scrolledComposite = new ScrolledComposite( parent, SWT.BORDER | SWT.V_SCROLL | SWT.H_SCROLL);
    scrolledComposite.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, true ) );
    final Composite composite = createLabelComposite( scrolledComposite, 80 );
    scrolledComposite.setContent( composite );
    scrolledComposite.setExpandHorizontal( true );
    scrolledComposite.setExpandVertical( true );
    scrolledComposite.setMinSize( composite.computeSize( SWT.DEFAULT, SWT.DEFAULT ) );
    composite.layout();
    return scrolledComposite;
  }

  private static void createScrolledComposite( Composite parent ) {
    final ScrolledComposite scrolledComposite = new ScrolledComposite( parent, SWT.BORDER | SWT.V_SCROLL | SWT.H_SCROLL);
    scrolledComposite.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, true ) );
    final Composite composite = new Composite( scrolledComposite, SWT.NONE );
    scrolledComposite.setContent( composite );
    scrolledComposite.setExpandHorizontal( true );
    scrolledComposite.setExpandVertical( true );
    composite.setLayout( new GridLayout( 1, true ) );
    createLabelComposite( composite, 40 );
    createButtonComposite( composite );
    createTable( composite ).setLayoutData( new GridData( 200, 200 ) );
    createList( composite ).setLayoutData( new GridData( 200, 200 ) );
    createMiniScrolledComposite( composite ).setLayoutData( new GridData( 200, 200 ) );
    createMiniScrolledComposite( composite ).setLayoutData( new GridData( 200, 200 ) );
    createTextComposite( composite );
    scrolledComposite.setMinSize( composite.computeSize( SWT.DEFAULT, SWT.DEFAULT ) );
    composite.layout();
  }

  private static void createTextComposite( final Composite composite ) {
    Composite textComposite = new Composite( composite, SWT.NONE );
    textComposite.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, false ) );
    textComposite.setLayout( new GridLayout( 4, true ) );
    for( int i = 0; i < 40; i++ ) {
      new Text( textComposite, SWT.BORDER ).setText( "Text " + i );
    }
  }

  @SuppressWarnings("serial")
  private static void createButtonComposite( final Composite composite ) {
    Composite buttonComposite = new Composite( composite, SWT.NONE );
    buttonComposite.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, false ) );
    buttonComposite.setLayout( new GridLayout( 4, true ) );
    for( int i = 0; i < 40; i++ ) {
      Button button = new Button( buttonComposite, SWT.PUSH );
      button.setText( "Button " + i );
      button.addSelectionListener( new SelectionAdapter() {
        @Override
        public void widgetSelected( SelectionEvent e ) {
          MessageBox message = new MessageBox( composite.getShell() );
          message.setMessage( "SelectionEvent" );
          System.out.println( "SelectionEvent" );
       // MessageBox is somehow broken in Android
          //DialogUtil.open( message, null );
        }
      } );
    }
  }

  @SuppressWarnings("serial")
  private static Composite createLabelComposite( final Composite composite, int number ) {
    Composite labelComposite = new Composite( composite, SWT.NONE );
    labelComposite.setLayoutData( new GridData( SWT.FILL, SWT.FILL, true, false ) );
    labelComposite.setLayout( new GridLayout( 4, true ) );
    for( int i = 0; i < number; i++ ) {
      Label label = new Label( labelComposite, SWT.NONE );
      label.setText( "Label " + i );
      label.setLayoutData( new GridData( SWT.DEFAULT, SWT.DEFAULT ) );
      label.addMouseListener( new MouseListener() {
        public void mouseDown( MouseEvent e ) {
          MessageBox message = new MessageBox( composite.getShell() );
          message.setMessage( "MouseDown" );
          System.out.println( "MouseDown" );
          // MessageBox is somehow broken in Android
          //DialogUtil.open( message, null );
        }
        public void mouseDoubleClick( MouseEvent e ) {}
        public void mouseUp( MouseEvent e ) {}
      } );
    }
    return labelComposite;
  }

}
