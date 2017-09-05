
// http://qiita.com/egnr-in-6matroom/items/37e65bb642d2e158804c
const DateFormat = {
  fmt : {
    "yyyy": function(date) { return date.getFullYear() + ''; },
    "MM": function(date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
    "dd": function(date) { return ('0' + date.getDate()).slice(-2); },
    "hh": function(date) { return ('0' + date.getHours()).slice(-2); },
    "mm": function(date) { return ('0' + date.getMinutes()).slice(-2); },
    "ss": function(date) { return ('0' + date.getSeconds()).slice(-2); }
  },
  toString: function toString(date, format) {
    var result = format;
    for (var key in this.fmt)
      result = result.replace(key, this.fmt[key](date));
    return result;
  }
};
const fs = require('fs');
const remote = require('electron').remote;

class Model {
  constructor() {
    this.model = null;
  }
  _reset() {
    // let today = new Date().toFormat("YYYY/MM/DD");
    let today = DateFormat.toString(new Date(), "yyyy/MM/dd");
    // let today = ("YYYY/MM/DD");
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [25, 25, 30, 30],
      content: [],
      header: {
        columns: [
          { text: `印刷日付\t${today}`, alignment: 'left', margin: [26, 15, 0, 20] }
        ]
      },
      footer: {
        columns: [
          { text: 'author: tikyuu', alignment: 'right', margin: [0, 0, 30, 10] }
        ]
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        grayHeader: {
          fillColor: '#e7e7e7',
        },

        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        },
        test: {
          margin: [212, 0, 0, 0]
        }
      },
      defaultStyle: {
        font: 'msgothic',
        alignment: 'center',
        fontSize: 9,
      },
    };
  }
  reset() {
    this.model = this._reset();
  }
  create(json_path) {
    let json = this._read_json(json_path);
    this.model.content.push(this._create_header(json));
    this.model.content.push(this._create_table_user(json));
    this.model.content.push(this._create_table_records(json));
    this.model.content.push(this._create_table_total(json));
    this.model.content.push(this._create_table_stamp(json));

    // pdfMake.createPdf(this.model).download();
    let pdf = pdfMake.createPdf(this.model);
    let name = (json.user_table !== undefined) ? json.user_table.name : "null";
    pdfMake.createPdf(this.model).download(`出勤簿 ${name}.pdf`);
    log.innerHTML = "complete!";
  }
  _read_json(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
  }
  _create_table_total(json) {
    // let total = json.total_table;
    let total = (json.total_table !== undefined) ? json.total_table : {};
    for (let item of ["attendance", "absence", "vacation", "extension_time", "over_time", "late_time", "work_time", "remarks"]) {
      if (!(item in total)) {
        total[item] = "null";
      }
    }

    return {
      margin: [0, 0, 0, 10],
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*', '*', '*', '*'],
        body: [
          [
            { text: "出勤日数", style: 'grayHeader' },
            { text: "欠勤日数", style: 'grayHeader' },
            { text: "年休取得日数", style: 'grayHeader' },
            { text: "延長時間", style: 'grayHeader' },
            { text: "深夜残業", style: 'grayHeader' },
            { text: "遅早時間", style: 'grayHeader' },
            { text: "総労働時間", style: 'grayHeader' },
          ],
          [
            { text: total.attendance, alignment: 'right' },
            { text: total.absence, alignment: 'right' },
            { text: total.vacation, alignment: 'right' },
            { text: total.extension_time, alignment: 'right' },
            { text: total.over_time, alignment: 'right' },
            { text: total.late_time, alignment: 'right' },
            { text: total.work_time, alignment: 'right' },
          ],
          [{ text: "備考", colSpan: 7, style: 'grayHeader' }, "", "", "", "", "", ""],
          [{ text: total.remarks + " ", colSpan: 7 }, "", "", "", "", "", ""]
        ]
      }
    };
  }
  _create_table_stamp(json) {
    return {
      alignment: 'center',
      margin: [313, 0, 0, 0],
      table: {
        headerRows: 1,
        widths: [
          80, 60, 60
        ],
        body: [
          ["総務", "所属長", "本人"],
          [
            { text: " ", fontSize: 24 },
            { text: " ", fontSize: 24 },
            { text: " ", fontSize: 24 },
          ],
        ],
      }
    };
  }
  _create_table_records(json) {
    // let records = json.record_tables;
    let records = (json.record_tables !== undefined) ? json.record_tables : [];

    let data = [
      {
        margin: [0, 0, 0, 10],
        table: {
          widths: [
            '5%', '5%', '5%', '7%', '7%',
            '10%', '10%', '10%', '37%', '4%',
          ],
          body: [
            [
              { text: '日', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '曜日', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '休日', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '始業', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '終業', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '労働時間帯', style: 'grayHeader', rowSpan: 1, colSpan: 2 },
              '',
              { text: '遅早欠勤', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '備考', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
              { text: '印', style: 'grayHeader', rowSpan: 2, margin: [0, 7] },
            ],
            [
              '',
              '',
              '',
              '',
              '',
              { text: '所定内', style: 'grayHeader' },
              { text: '所定外', style: 'grayHeader' },
              '',
              '',
              ''
            ],
          ]
        }
      }
    ];

    for (let i = 0; i < records.length; i++) {
      let record = records[i];
      for (let item of ["day", "weekday", "holiday", "start_time", "end_time", "work_time", "over_time", "absence_or_late", "remarks", "stamp"]) {
        if (!(item in record)) {
          record[item] = "null";
        }
      }

      let v = [
        { text: record.day, margin: [0, 1] },
        { text: record.weekday, margin: [0, 1] },
        { text: record.holiday, margin: [0, 1] },
        { text: record.start_time, margin: [0, 1] },
        { text: record.end_time, margin: [0, 1] },
        { text: record.work_time, margin: [0, 1] },
        { text: record.over_time, margin: [0, 1] },
        { text: record.absence_or_late, margin: [0, 1] },
        { text: record.remarks, margin: [0, 1], alignment: "left" },
        { text: record.stamp, margin: [0, 1] },
      ];
      data[0].table.body.push(v);
    }

    return data;
  }
  _create_header(json) {
    // let title = new Date().toFormat("YYYY 年 MM 月度 出勤簿");
    let title = DateFormat.toString(new Date(), "yyyy 年 MM 月度 出勤簿");
    // let title = ("YYYY 年 MM 月度 出勤簿");
    return {
      text: title,
      fontSize: 13,
      margin: [0, 0, 0, 10]
    };
  }
  _create_table_user(json) {
    let user = (json.user_table !== undefined) ? json.user_table : {};
    for (let item of ["number", "name", "affilication"]) {
      if (!(item in user)) {
        user[item] = "null";
      }
    }
    return {
      margin: [0, 0, 0, 5],
      columns: [
        {
          width: '*',
          text: `従業員番号: ${user.number}`,
          alignment: 'left'
        },
        {
          width: '*',
          text: `氏名: ${user.name}`,
          alignment: 'left'
        },
        {
          width: '*',
          text: `所属: ${user.affilication}`,
          alignment: 'left'
        },
      ]
    };
  }
}
class Controller {
  constructor() {
    this.model = new Model();
    this._init_pdf_fonts();
  }
  run(json_path) {
    if (!this._is_exist_file(json_path)) {
      return;
    }
    if (!this._is_json(json_path)) {
      return;
    }

    this.model.reset();
    let data = this.model.create(json_path);
  }

  _is_exist_file(file) {
    try {
      fs.statSync(file);
      return true;
    } catch (err) {
      log.innerHTML = `ファイルが存在しません。 ${err}`;
      if (err.code === 'ENOENT') return false;
    }
  }
  _is_json(path) {
    try {
      let _ = JSON.parse(fs.readFileSync(path, 'utf8'));
      return true;
    } catch (e) {
      log.innerHTML = `jsonファイルの構造が間違っています。 ${e}`;
      return false;
    }
  }

  _init_pdf_fonts() {
    pdfMake.fonts = {
      msgothic: {
        normal: 'YUMIN.TTF',
        bold: 'YUMIN.TTF',
        italics: 'YUMIN.TTF',
        bolditalics: 'YUMIN.TTF',
      }
    };
  }
}



let box = document.getElementById("box");
let check_box = document.getElementById("check-button");
let log = document.getElementById("log");
check_box.onclick = (ev) => {
  let window = remote.getCurrentWindow();
  window.close();
};

// https://css-tricks.com/drag-and-drop-file-uploading/
['dragover', 'dragenter', 'dragleave', 'dragend', 'drop'].forEach((event_name) => {
  box.addEventListener(event_name, (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
});
['dragover', 'dragenter'].forEach((event_name) => {
  box.addEventListener(event_name, (e) => {
    box.classList.add('is-dragover');
    log.innerHTML = 'dragover | dragenter';
  });
});
['dragleave', 'dragend', 'drop'].forEach((event_name) => {
  box.addEventListener(event_name, (e) => {
    box.classList.remove('is-dragover');
    log.innerHTML = `dragleave, dragend, drop`;
  });
});
box.addEventListener('drop', (e) => {
  let path = e.dataTransfer.files[0].path;
  log.innerHTML = `${path}`;
  let controller = new Controller();
  try {
    controller.run(path);
  } catch (err) {
    log.innerHTML = `${err.message}`;
  }
});