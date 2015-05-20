#!/bin/bash
set -e
date

## ADD your environment variables before you start

# print versions
chromedriver --version
google-chrome-stable --version
# Starting Firefox will get us this message
# GLib-CRITICAL **: g_slice_set_config: assertion 'sys_page_size == 0' failed
# https://bugzilla.mozilla.org/show_bug.cgi?id=833117
# firefox -version
firefox --version 2>/dev/null
echo 'Starting Xvfb ...'
export DISPLAY=:99
2>/dev/null 1>&2 Xvfb :99 -shmem -screen 0 1366x768x16 &
echo 'Starting Selenium server ... access it at http://127.0.0.1:4444/wd/hub'
2>/dev/null 1>&2 nohup java -jar /home/root/selenium-server-standalone-2.45.0.jar -Djava.security.egd=file:/dev/./urandom > /tmp/selenium.log &

# start your worker with a queue name and dir to store the data
# run.sitespeed.io-worker nyc /home/root/sitespeedio/
run.sitespeed.io-worker
