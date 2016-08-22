/**
 * 页面分析器
 **/
import cheerio from 'cheerio';
import _ from 'lodash';


class Parse {
    constructor(pattern) {
        if (!(pattern instanceof RegExp)) throw new Error(
            'Parse pattern should be a RegExp. [' + pattern + ']');

        this.pattern = pattern;
    }

    match(url) {
        return this.pattern.test(url);
    }

    parse(data, cb) {
        return cb();
    }
}

class UserParse extends Parse {
    constructor() {
        super(/^(http:\/\/)?www\.my-guide\.cc\/users\/\d+.*$/);
    }

    parse(data, cb) {
        let works = [];
        let $ = cheerio.load(data);
        let $works = $('.work-thumbnail');
        $works.each((index, $work) => {
            let work = {};
            $work = $($work);
            work.href = $work.children('a').attr('href');
            work.title = _.trim($work.children('a').children(
                '.title').text());
            work.date = _.trim($work.children('a').children(
                '.author').text());
            work.thumbnail = $work.children('a').children('img').attr(
                'src');

            works.push(work);
        })
        cb(null, works);
    }
}

class WorkParse extends Parse {
    constructor() {
        super(/^(http:\/\/)?www\.my-guide\.cc\/works\/\d+.*$/)
    }
    parse(data, cb) {
        let images = [];
        let $ = cheerio.load(data);
        try {
            let _images = JSON.parse($('#imgs_json').text());
            for (let image of _images) {
                if (image.height === 'auto') {
                    images.push('http://img.my-guide.cc/forum/' + image
                        .img);
                } else {
                    images.push(
                        'http://img.my-guide.cc/uploads/images/920/' +
                        image
                        .img);
                }

            }
        } catch (e) {
            return cb(new Error('Images data not a json.'));
        }

        cb(null, images);
    }
}


class UserInfoParse extends Parse {
    parse(data, cb) {
        let $ = cheerio.load(data);
        let authorName = $('.author_name').text();
        let about = $('.about').text();
        let fansCount = $('.fansBtn').children('span').eq(2).text();
        let info = $('.info_body').text();

        cb();
    }
}

export {
    Parse,
    UserParse,
    UserInfoParse,
    WorkParse
};
