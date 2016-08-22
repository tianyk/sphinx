import request from 'request';
import download from 'download';
import {
    Parse
}
from './parse';

const HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache',
    'Referer': 'http://www.my-guide.cc',
    // 'Host': 'img.my-guide.cc',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36'
};

// basic request callback
function _brc(cb) {
    return function(err, response, data) {
        if (err) return cb(err);

        let statusCode = response.statusCode;
        if (statusCode === 200)
            cb(null, data);
        else
            cb(new Error('Request Error. [' + statusCode + ']'));
    }
}


class Sphinx {
    constructor(parses) {
        this.parses = [];

        let j = request.jar();
        this.session = request.defaults({
            jar: j,
            headers: HEADERS,
            gzip: true,
            timeout: 60 * 1000,
            // proxy: 'http://127.0.0.1:8888/'
        });
        this.request = request.defaults({
            headers: HEADERS,
            gzip: true,
            timeout: 60 * 1000,
            // proxy: 'http://127.0.0.1:8888/'
        });

        if (Array.isArray(parses)) {
            this.addParse(...parses)
        } else {
            this.addParse(parses);
        }
    }

    download(url, desc, cb) {
        download(url, desc, {
            headers: HEADERS
        }).then(function() {
            cb();
        }).catch((err) => {
            console.log('Download image fail. [' +
                url + '] [' + desc + '] [' + err.stack + ']');
            cb();
        })
    }

    addParse(...parses) {
        for (let parse of parses) {
            if (!(parse instanceof Parse)) throw new Error(
                'Invalid parse.');
            this.parses.push(parse);
        }
    }

    parse(url, cb) {
        let self = this;
        let parse;
        for (let _parse of self.parses) {
            if (_parse.match(url)) {
                parse = _parse;
                break;
            }
        }
        if (!parse) return cb(new Error('No parse. [' + url + ']'));

        self.request.get(url, _brc((err, data) => {
            if (err) return cb(err);

            parse.parse(data, cb);
        }));
    }
}

export default Sphinx;
