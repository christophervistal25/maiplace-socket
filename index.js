const { default: Axios } = require("axios");
const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
const axios = require('axios')

//axios.baseURL = "http://51.79.242.246/maiplace/public/";



const server = app.listen(`${port}`, () => {
    console.log(`Server started on port ${port}`);
});

const io = require("socket.io")(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    console.log('user connect');
    
    socket.on('test', (args) => {
        console.log(args);
    });

    socket.on('order_send', (orders) => {
		axios.post('http://192.168.1.11:8000/api/customer/order', orders).then((response) => {
            if(response.status === 200) {
                console.log(`New order with code ${response.data[0].order_code}`);
                io.emit(`order_success_${response.data[0].customer_id}`, { order_code : response.data[0].order_code});
                io.emit('customer_send_order', response.data[0].order_code);
            }
        }).catch(err => console.log(err));
    });
	
	
	socket.on('order_prepared', (orders) => {
		orders.message = `Your order with code ${orders.order_code} is now being prepared.`;
		io.emit(`customer_order_prepared_${orders.customer_id}`, orders);
		
    });
	

    socket.on('order_cancel', (orders) => {
		axios.post('api/customer/orders/cancel', orders).then((response) => {
		console.log(response.data);
            if(response.data.code === 201) {

				io.emit('customer_cancel_order', response.data.order_code);
				
                io.emit(`customer_cancel_order_${response.data.customer_id}`, response.data);
            } else if(response.data.code === 422) {

				io.emit(`customer_cancel_order_${response.data.customer_id}`, response.data);
            }
        }).catch(err => console.log(err));
    });
	
	


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});