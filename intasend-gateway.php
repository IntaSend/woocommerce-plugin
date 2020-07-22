<?php

/**
 * Plugin Name: IntaSend Payment for Woocomerce
 * Plugin URI: https://intasend.com
 * Author Name: Felix Cheruiyot
 * Author URI: https://github.com/felixcheruiyot
 * Description: Collect M-Pesa and card payments payments using IntaSend Payment Gateway
 * Version: 1.0.0
 */


/*
 * This action hook registers our PHP class as a WooCommerce payment gateway
 */
add_filter('woocommerce_payment_gateways', 'intasend_add_gateway_class');
function intasend_add_gateway_class($gateways)
{
    $gateways[] = 'WC_IntaSend_Gateway'; // your class name is here
    return $gateways;
}

/*
 * The class itself, please note that it is inside plugins_loaded action hook
 */
add_action('plugins_loaded', 'intasend_init_gateway_class');
function intasend_init_gateway_class()
{

    class WC_IntaSend_Gateway extends WC_Payment_Gateway
    {

        /**
         * Class constructor, more about it in Step 3
         */
        public function __construct()
        {

            $this->id = 'intasend'; // payment gateway plugin ID
            $this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name
            $this->has_fields = true; // in case you need a custom form
            $this->method_title = 'IntaSend Gateway';
            $this->method_description = 'Collect M-Pesa and card payments payments using IntaSend Payment Gateway'; // will be displayed on the options page

            // gateways can support subscriptions, refunds, saved payment methods,
            // but in this tutorial we begin with simple payments
            $this->supports = array(
                'products'
            );

            // Method with all the options fields
            $this->init_form_fields();

            // Load the settings.
            $this->init_settings();
            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->enabled = $this->get_option('enabled');
            $this->testmode = 'yes' === $this->get_option('testmode');
            $this->public_key = $this->testmode ? $this->get_option('test_public_key') : $this->get_option('live_public_key');

            // This action hook saves the settings
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

            // We need custom JavaScript to obtain a token
            add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));

            // You can also register a webhook here
            // add_action( 'woocommerce_api_{webhook name}', array( $this, 'webhook' ) );

        }

        /**
         * Plugin options, we deal with it in Step 3 too
         */
        public function init_form_fields()
        {
            $this->form_fields = array(
                'enabled' => array(
                    'title'       => 'Enable/Disable',
                    'label'       => 'Enable IntaSend Gateway',
                    'type'        => 'checkbox',
                    'description' => '',
                    'default'     => 'no'
                ),
                'title' => array(
                    'title'       => 'Title',
                    'type'        => 'text',
                    'description' => 'This controls the title which the user sees during checkout.',
                    'default'     => 'Lipa na MPesa, Visa, and MasterCard (card payments)',
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => 'Description',
                    'type'        => 'textarea',
                    'description' => 'This controls the description which the user sees during checkout.',
                    'default'     => 'Pay with MPesa or card securely using IntaSend Gateway.',
                ),
                'testmode' => array(
                    'title'       => 'Test mode',
                    'label'       => 'Enable Test Mode',
                    'type'        => 'checkbox',
                    'description' => 'Place the payment gateway in test mode using test API keys.',
                    'default'     => 'yes',
                    'desc_tip'    => true,
                ),
                'test_public_key' => array(
                    'title'       => 'Test Public Key',
                    'type'        => 'text'
                ),
                'live_public_key' => array(
                    'title'       => 'Live Public Key',
                    'type'        => 'text',
                )
            );
        }

        /**
         * You will need it if you want your custom form, Step 4 is about it
         */
        public function payment_fields()
        {
            // 
        }

        /*
		 * Custom CSS and JS, in most cases required only when you decided to go with a custom form
		 */
        public function payment_scripts()
        {
            // we need JavaScript to process a token only on cart/checkout pages, right?
            if (!is_cart() && !is_checkout() && !isset($_GET['pay_for_order'])) {
                return;
            }

            // if our payment gateway is disabled, we do not have to enqueue JS too
            if ('no' === $this->enabled) {
                return;
            }

            // no reason to enqueue JavaScript if API keys are not set
            if (empty($this->public_key)) {
                return;
            }

            // // do not work with card detailes without SSL unless your website is in a test mode
            if (!$this->testmode && !is_ssl()) {
                return;
            }

            // // let's suppose it is our payment processor JavaScript that allows to obtain a token
            wp_enqueue_script('intasend_js', 'https://unpkg.com/intasend-inlinejs-sdk@2.0.0/build/intasend-inline.js');

            // // and this is our custom JS in your plugin directory that works with token.js
            wp_register_script('woocommerce_intasend', plugins_url('intasend.js', __FILE__), array('jquery', 'intasend_js'));

            // // in most payment processors you have to use PUBLIC KEY to obtain a token
            wp_localize_script('woocommerce_intasend', 'intasend_params', array(
                'public_key' => $this->public_key
            ));

            wp_enqueue_script('woocommerce_intasend');
        }

        /*
 		 * Fields validation, more in Step 5
		 */
        public function validate_fields()
        {
            if (empty($_POST['billing_first_name'])) {
                wc_add_notice('First name is required!', 'error');
                return false;
            }
            if (empty($_POST['billing_email'])) {
                wc_add_notice('Email is required!', 'error');
                return false;
            }
            if (empty($_POST['billing_phone'])) {
                wc_add_notice('Phone number is required!', 'error');
                return false;
            }
            return true;
        }

        /*
		 * Check if payment is successful and complete transaction
		 */
        public function process_payment($order_id)
        {
            global $woocommerce;

            // we need it to get any order detailes
            $order = wc_get_order($order_id);

            $order->update_status('on-hold', __('Validating payment status', 'wc-gateway-offline'));

            // we received the payment
            $order->payment_complete();
            $order->reduce_order_stock();

            // some notes to customer (replace true with false to make it private)
            $order->add_order_note('Hey, your order is paid! Thank you!', true);

            // Empty cart
            $woocommerce->cart->empty_cart();

            // Redirect to the thank you page
            return array(
                'result' => 'success',
                'redirect' => $this->get_return_url($order)
            );

            // /*
            //   * Array with parameters for API interaction
            //  */
            // $args = array();

            // /*
            //  * Your API interaction could be built with wp_remote_post()
            //   */
            // $response = wp_remote_post('{payment processor endpoint}', $args);


            // if (!is_wp_error($response)) {

            //     $body = json_decode($response['body'], true);

            //     // it could be different depending on your payment processor
            //     if ($body['response']['responseCode'] == 'APPROVED') {

            //         // we received the payment
            //         $order->payment_complete();
            //         $order->reduce_order_stock();

            //         // some notes to customer (replace true with false to make it private)
            //         $order->add_order_note('Hey, your order is paid! Thank you!', true);

            //         // Empty cart
            //         $woocommerce->cart->empty_cart();

            //         // Redirect to the thank you page
            //         return array(
            //             'result' => 'success',
            //             'redirect' => $this->get_return_url($order)
            //         );
            //     } else {
            //         wc_add_notice('Please try again.', 'error');
            //         return;
            //     }
            // } else {
            //     wc_add_notice('Connection error.', 'error');
            //     return;
            // }
        }

        /*
		 * In case you need a webhook, like PayPal IPN etc
		 */
        public function webhook()
        {
            $order = wc_get_order($_GET['id']);
            $order->payment_complete();
            $order->reduce_order_stock();

            update_option('webhook_debug', $_GET);
        }
    }
}