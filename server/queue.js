/**
 * Sitespeed.io - How speedy is your site? (http://www.sitespeed.io)
 * Copyright (c) 2015, Peter Hedenskog, Tobias Lidskog
 * and other contributors
 * Released under the Apache 2.0 License
 */
'use strict';
var RedisSMQ = require('rsmq'),
	log = require('winston');

var redisHost = process.env.REDIS_HOST;
var queues = process.env.REDIS_QUEUES;
var redisPassword = process.env.REDIS_PASSWORD;

if (!redisHost || !queues || !redisPassword) {
	console.log('Missing env info, make sure REDIS is configured ' + JSON.stringify(process.env));
	process.exit(1);
}

log.info('Will setup queues ' + queues + ' on ' + redisHost);

queues = queues.split(',');

var rsmq = new RedisSMQ({
	host: redisHost,
	port: 6379,
	options: {
		'auth_pass': redisPassword
	}
});

// TODO check if the queues exists
queues.forEach(function(queue) {
	rsmq.createQueue({
		qname: queue
	}, function(err, resp) {
		if (err && err.name === 'queueExists') {
			log.info('The queue ' + queue + ' already exists');
		} else if (err) {
			log.error('Couldn\'t create the queue ' + queue, err);
		} else {
			log.info('Created queue ' + queue);
		}
	});
});


module.exports = {
	add: function(queue, config, id, path, cb) {
		rsmq.sendMessage({
			qname: queue,
			message: JSON.stringify({
				id: id,
				u: config.url,
				p: path,
				b: config.browser,
				c: config.connection
			})
		}, function(err, resp) {
			if (resp) {
				log.debug('Message sent. ID:', resp);
				cb(err, resp);
			} else {
				log.error('Couldn\'t send message on queue ' + queue, err);
				cb(err);
			}
		});
	}

};
