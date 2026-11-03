/**
 * Google Apps Script — tạo Google Form RSVP cho Tiệc Cưới Trí & Như.
 *
 * Cách dùng:
 *   1. https://script.google.com → New project → paste file này vào Code.gs
 *   2. Chạy createWeddingForm() — accept quyền Forms/Drive
 *   3. Xem Execution log để lấy link form
 *   4. (Tùy chọn) Sửa danh sách GUESTS rồi chạy generatePrefillUrls()
 */

const VENUE = 'AZ Luxury Garden, 123 Tôn Đức Thắng, La Gi, Lâm Đồng';
const MAPS_URL = 'https://www.google.com/maps?cid=9565425146171843812';
const DATE_LABEL = 'Chủ nhật, 14/06/2026';
const CEREMONY_TIME = '17h30';
const BUS_DEPART = '14h30';
Calendar;
const CONTACT = 'Trí - 0900 000 000';

function createWeddingForm() {
  const form = FormApp.create('Tiệc Cưới — Trí & Như')
    .setDescription(
      '📅 ' +
        DATE_LABEL +
        ' — 🕐 ' +
        CEREMONY_TIME +
        '\n' +
        '📍 ' +
        VENUE +
        '\n' +
        '🗺️ ' +
        MAPS_URL +
        '\n' +
        '☎️ Liên hệ: ' +
        CONTACT +
        '\n\n' +
        'Vợ chồng em trân trọng kính mời anh/chị tới chung vui. Nhờ anh/chị dành chút thời gian xác nhận thông tin giúp em ạ ❤️',
    )
    .setAllowResponseEdits(true)
    .setCollectEmail(false)
    .setConfirmationMessage(
      'Em đã ghi nhận thông tin, cảm ơn anh/chị ạ. Nếu cần thay đổi, anh/chị mở lại link form là chỉnh sửa được. Mọi vấn đề xin liên hệ ' +
        CONTACT +
        '.',
    );

  // ----- Section 1: Thông tin khách -----
  const nameItem = form.addTextItem().setTitle('Họ và tên').setRequired(true);

  // ----- Section 2: Xác nhận tham dự -----
  form.addPageBreakItem().setTitle('Xác nhận tham dự');
  const attendItem = form
    .addMultipleChoiceItem()
    .setTitle('Anh/chị có thể tham dự không ạ?')
    .setRequired(true);

  // ----- Section 3: Dự tiệc -----
  const sectionFeast = form.addPageBreakItem().setTitle('Thông tin dự tiệc');
  form
    .addTextItem()
    .setTitle('Số người tham dự tiệc (gồm cả trẻ em)')
    .setRequired(true)
    .setValidation(intAtLeast(1));
  const busOptItem = form
    .addMultipleChoiceItem()
    .setTitle('Anh/chị có đăng ký đi xe đưa đón không ạ?')
    .setHelpText(
      'Xe khởi hành lúc ' +
        BUS_DEPART +
        ', có 2 điểm đón tại Quận 1 và Tân Phú.',
    )
    .setRequired(true);

  // ----- Section 4: Xe đưa đón -----
  const sectionBus = form.addPageBreakItem().setTitle('Xe đưa đón');
  form
    .addMultipleChoiceItem()
    .setTitle('Điểm đón (xe đón ở đâu sẽ trả về đó)')
    .setChoiceValues(['Quận 1', 'Tân Phú'])
    .setRequired(true);
  form
    .addMultipleChoiceItem()
    .setTitle('Chiều đi (' + BUS_DEPART + ' xuất phát)')
    .setChoiceValues(['Có đi chiều đi', 'Không đi chiều đi'])
    .setRequired(true);
  form
    .addTextItem()
    .setTitle('Số người đi chiều đi')
    .setHelpText('Nếu không đi, để trống')
    .setValidation(intAtLeast(0));
  form
    .addMultipleChoiceItem()
    .setTitle('Chiều về (sau tiệc)')
    .setChoiceValues(['Có đi chiều về', 'Không đi chiều về'])
    .setRequired(true);
  form
    .addTextItem()
    .setTitle('Số người đi chiều về')
    .setHelpText('Nếu không đi, để trống')
    .setValidation(intAtLeast(0));
  form
    .addParagraphTextItem()
    .setTitle('Danh sách hành khách đi xe (họ tên + năm sinh)')
    .setHelpText(
      'Dạ do phía nhà xe cần danh sách hành khách để làm thủ tục, kính mong anh/chị thông cảm điền giúp em ạ.\n' +
        'Mỗi người 1 dòng, format: Họ tên - Năm sinh\n' +
        'VD: Nguyễn Văn A - 1990',
    )
    .setRequired(true);

  // ----- Section 5: Ghi chú khác (chỉ cho khách có tham dự) -----
  const sectionOtherNotes = form.addPageBreakItem().setTitle('Ghi chú khác');
  form
    .addParagraphTextItem()
    .setTitle('Ghi chú khác')
    .setHelpText('Bất cứ điều gì anh/chị muốn lưu ý');

  // ----- Section 6: Lời chúc -----
  const sectionWishes = form.addPageBreakItem().setTitle('Lời chúc');
  form.addParagraphTextItem().setTitle('Lời chúc gửi cô dâu & chú rể ❤️');

  // ----- Branching: set sau khi mọi section đã tồn tại -----
  attendItem.setChoices([
    attendItem.createChoice('Có, sẽ tham dự ạ', sectionFeast),
    attendItem.createChoice('Rất tiếc, không tham dự được ạ', sectionWishes),
  ]);
  busOptItem.setChoices([
    busOptItem.createChoice('Có, đăng ký xe ạ', sectionBus),
    busOptItem.createChoice('Không, tự di chuyển', sectionOtherNotes),
  ]);

  const meta = {
    formId: form.getId(),
    publishedUrl: form.getPublishedUrl(),
    editUrl: form.getEditUrl(),
    nameId: nameItem.getId(),
  };
  PropertiesService.getScriptProperties().setProperty(
    'WEDDING_FORM_META',
    JSON.stringify(meta),
  );

  Logger.log('✅ Form tạo xong');
  Logger.log('📝 Edit:   ' + meta.editUrl);
  Logger.log('🔗 Public: ' + meta.publishedUrl);
  return meta;
}

function intAtLeast(min) {
  return FormApp.createTextValidation()
    .requireNumberGreaterThanOrEqualTo(min)
    .setHelpText('Vui lòng nhập 1 số nguyên ≥ ' + min)
    .build();
}

/**
 * Tạo URL pre-fill cho từng khách. Sửa GUESTS bên dưới rồi chạy.
 */
function generatePrefillUrls() {
  const GUESTS = ['Nguyễn Văn A', 'Trần Thị B'];

  const metaRaw =
    PropertiesService.getScriptProperties().getProperty('WEDDING_FORM_META');
  if (!metaRaw)
    throw new Error('Chưa tạo form — chạy createWeddingForm() trước.');
  const meta = JSON.parse(metaRaw);
  const form = FormApp.openById(meta.formId);
  const nameItem = form.getItemById(meta.nameId).asTextItem();

  const rows = [['Tên', 'URL']];
  GUESTS.forEach(function (name) {
    const url = form
      .createResponse()
      .withItemResponse(nameItem.createResponse(name))
      .toPrefilledUrl();
    rows.push([name, url]);
  });
  Logger.log('Paste TSV dưới đây vào Google Sheet:');
  Logger.log(
    rows
      .map(function (r) {
        return r.join('\t');
      })
      .join('\n'),
  );
}
