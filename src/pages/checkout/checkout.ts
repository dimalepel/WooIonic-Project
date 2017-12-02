import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as WC from 'woocommerce-api';
//import { HomePage } from '../home/home';
import { MenuPage } from '../menu/menu';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';

@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html',
})
export class CheckoutPage {

  WooCommerce: any;
  newOrder: any;
  paymentMethods: any[];
  paymentMethod: any;
  billing_shipping_same: boolean;
  userInfo: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public storage: Storage, public alertCtrl: AlertController, private payPal: PayPal) {
    this.newOrder = {};
    this.newOrder.billing_address = {};
    this.newOrder.shipping_address = {};
    this.billing_shipping_same = false;

    this.paymentMethods = [
      { method_id: "bacs", method_title: "Direct Bank Transfer" },
      { method_id: "cheque", method_title: "Cheque Payment" },
      { method_id: "cod", method_title: "Cash on Delivery" },
      { method_id: "paypal", method_title: "PayPal" }
    ];

    this.WooCommerce = WC({
      url: "http://shop.remont-okon-vitebsk.by/",
      consumerKey: "ck_6b37527e8b31641dfc6656ab15c09d741f5ea545",
      consumerSecret: "cs_155ff9d96ee95b3258324a644deba49a363ba8e8"
    });

    this.storage.get("userLoginInfo").then( (userLoginInfo) => {
      
      this.userInfo = userLoginInfo.user;
      
      let email = userLoginInfo.user.email;
      
      this.WooCommerce.getAsync("customers/email/"+email).then( (data) => {
      
        this.newOrder = JSON.parse(data.body).customer;
      
      })
      
    })

  }

  setBillingToShipping(){
    this.billing_shipping_same = !this.billing_shipping_same;

    if(this.billing_shipping_same)
    {
      this.newOrder.shipping_address = this.newOrder.billing_address;
    }

  }

  placeOrder(){
    
        let orderItems: any[] = [];
        let data: any = {};
    
        let paymentData: any = {};
    
        this.paymentMethods.forEach( (element, index) => {
          if(element.method_id == this.paymentMethod){
            paymentData = element;
          }
        });
    
    
        data = {
          payment_details : {
            method_id: paymentData.method_id,
            method_title: paymentData.method_title,
            paid: true
          },
    
          billing_address: this.newOrder.billing_address,
          shipping_address: this.newOrder.shipping_address,
          customer_id: this.userInfo.id || '',
          line_items: orderItems
        };
    
    
        if(paymentData.method_id == "paypal"){
          //TODO
        } else {
    
          this.storage.get("cart").then( (cart) => {
    
            cart.forEach( (element, index) => {
              orderItems.push({
                product_id: element.product.id,
                quantity: element.qty
              });
            });
    
            data.line_items = orderItems;
    
            let orderData: any = {};
    
            orderData.order = data;
    
            this.WooCommerce.postAsync("orders", orderData).then( (data) => {
    
              let response = (JSON.parse(data.body).order);
    
              this.alertCtrl.create({
                title: "Order Placed Successfully",
                message: "Your order has been placed successfully. Your order number is " + response.order_number,
                buttons: [{
                  text: "OK",
                  handler: () => {
                    this.navCtrl.setRoot(MenuPage);
                  }
                }]
              }).present();
    
            })
    
          })
    
        }
    
    
      }
    
    }