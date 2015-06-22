var $text = null;
var $save = null;
var $poster = null;
var $themeButtons = null;
var $aspectRatioButtons = null;
var $quote = null;
var $fontSize = null;
var $show = null;
var $source = null;
var $logoWrapper = null;


// Change straight quotes to curly and double hyphens to em-dashes.
function smarten(a) {
  a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
  a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
  a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
  a = a.replace(/"/g, "\u201d");                            // closing doubles
  a = a.replace(/--/g, "\u2014");                           // em-dashes
  a = a.replace(/ \u2014 /g, "\u2009\u2014\u2009");         // full spaces wrapping em dash
  return a;
}

function convertToSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

function processText() {
    $text = $('.poster blockquote p, .source');
    $text.each(function() {
        var rawText = $.trim($(this).html());
        $(this).html(smarten(rawText)).find('br').remove();
    });
}

function saveImage() {
    // first check if the quote actually fits
    if (($timestamp.offset().top + $timestamp.height()) > $logoWrapper.offset().top) {
        alert("Your list doesn't fit. Shorten the text or choose a smaller font-size.");
        return;
    }

    $('canvas').remove();
    processText();

    html2canvas($poster, {
      onrendered: function(canvas) {
        document.body.appendChild(canvas);
        window.oCanvas = document.getElementsByTagName("canvas");
        window.oCanvas = window.oCanvas[0];
        var strDataURI = window.oCanvas.toDataURL();

        var quote = $('blockquote').text().split(' ', 5);
        var filename = convertToSlug(quote.join(' '));

        var a = $("<a>").attr("href", strDataURI).attr("download", "quote-" + filename + ".png").appendTo("body");

        a[0].click();

        a.remove();

        $('#download').attr('href', strDataURI).attr('target', '_blank');
        $('#download').trigger('click');
      }
    });
}

function adjustFontSize(size) {
    var fontSize = size.toString() + 'px';
    $poster.css('font-size', fontSize);
    if ($fontSize.val() !== size){
        $fontSize.val(size);
    };
}

$(function() {
    $text = $('.poster blockquote p, .source');
    $save = $('#save');
    $poster = $('.poster');
    $themeButtons = $('#theme .btn');
    $aspectRatioButtons = $('#aspect-ratio .btn');
    $fontSize = $('#fontsize');
    $showInput = $('#show');
    $timestampInput = $('#timestamp');
    $showCredit = $('.show-credit');
    $timestamp = $('.timestamp');
    $quote = $('#quote');
    $logoWrapper = $('.logo-wrapper');

    adjustFontSize(32);
    processText();

    $timestamp.text(moment().format('h:mm a zz') + ' EST')
    $timestampInput.val(moment().format('h:mm a zz') + ' EST')

    $save.on('click', saveImage);

    $themeButtons.on('click', function() {
        $themeButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        $poster.removeClass('poster-news poster-music poster-fresh-air poster-snap-judgement')
                    .addClass('poster-' + $(this).attr('id'));
    });

    $aspectRatioButtons.on('click', function() {
        $aspectRatioButtons.removeClass().addClass('btn btn-primary');
        $(this).addClass('active');
        $poster.removeClass('square sixteen-by-nine').addClass($(this).attr('id'));

        if ($poster.hasClass('sixteen-by-nine')) {
            $fontSize.attr('min', 24);
            $fontSize.val(24);
            adjustFontSize(32);
        } else {
            $fontSize.attr('min', 60);
            $fontSize.val(90);
            adjustFontSize(90);
        }
    });

    $quote.on('click', function() {
        $(this).find('button').toggleClass('btn-primary active');
        $poster.toggleClass('quote');
    });

    $fontSize.on('change', function() {
        adjustFontSize($(this).val());
    });

    $timestampInput.on('keyup', function() {
        var inputText = $(this).val();
        $timestamp.text(inputText);
    });

    $showInput.on('keyup', function() {
        var inputText = $(this).val();
        $showCredit.text(inputText);
    });

    // // This event is interfering with the medium editor in some browsers
    // $('blockquote').on('keyup', function(){

    //     console.log($(this)[0].selectionStart);
    //     process_text();
    // });


    var quoteEl = document.querySelectorAll('.poster blockquote');

    var quoteEditor = new MediumEditor(quoteEl, {
        disableToolbar: true,
        placeholder: 'Type your quote here'
    });
});
