var $text = null;
var $save = null;
var $poster = null;
var $themeButtons = null;
var $aspectRatioButtons = null;
var $fontSize = null;
var $showInput = null;
var $showCredit = null;
var $timestamp = null;
var $timestampInput = null;
var $kicker = null;
var $kickerInput = null;
var $source = null;
var $logoWrapper = null;
var $updateTime = null;

/*
 * Run on page load.
 */
var onDocumentLoad = function() {
    $text = $('.poster blockquote p, .source');
    $save = $('#save');
    $poster = $('.poster');
    $themeButtons = $('#theme .btn');
    $aspectRatioButtons = $('#aspect-ratio .btn');
    $fontSize = $('#fontsize');
    $showInput = $('#show');
    $showCredit = $('.show-credit');
    $timestampInput = $('#timestamp');
    $timestamp = $('.timestamp');
    $kicker = $('.kicker');
    $kickerInput = $('#kicker');
    $logoWrapper = $('.logo-wrapper');
    $updateTime = $('#update-time');

    $save.on('click', saveImage);
    $themeButtons.on('click', onThemeClick);
    $aspectRatioButtons.on('click', onAspectRatioClick);
    $fontSize.on('change', adjustFontSize);
    $kickerInput.on('keyup', onKickerKeyup);
    $timestampInput.on('keyup', onTimeStampKeyup);
    $updateTime.on('click', updateTimestamp);
    $showInput.on('keyup', onShowKeyup);

    adjustFontSize(null, 32);
    processText();
    updateTimestamp();
    setupMediumEditor();
}

/*
 * Change straight quotes to curly and double hyphens to em-dashes.
 */
var smarten = function(a) {
  a = a.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");       // opening singles
  a = a.replace(/'/g, "\u2019");                            // closing singles & apostrophes
  a = a.replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c"); // opening doubles
  a = a.replace(/"/g, "\u201d");                            // closing doubles
  a = a.replace(/--/g, "\u2014");                           // em-dashes
  a = a.replace(/ \u2014 /g, "\u2009\u2014\u2009");         // full spaces wrapping em dash
  return a;
}

/*
 * Convert a string to slug format
 */
var convertToSlug = function(text) {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
}

/*
 * Cleanup whitespace and smart quotes on text inputs
 */
var processText = function() {
    $text = $('.poster blockquote p, .source');
    $text.each(function() {
        var rawText = $.trim($(this).html());
        $(this).html(smarten(rawText)).find('br').remove();
    });
}

/*
 * Set the timestamp text to the current time
 */
var updateTimestamp = function() {
    $timestamp.text(moment().format('MMMM D, YYYY h:mm A') + ' ET')
    $timestampInput.val(moment().format('MMMM D, YYYY h:mm A') + ' ET')
}

/*
 * Convert the poster HTML/CSS to canvas and export an image
 */
var saveImage = function() {
    // first check if the quote actually fits
    if (($timestamp.offset().top + $timestamp.height()) > $logoWrapper.offset().top) {
        alert("Your list doesn't fit. Shorten the text or choose a smaller font-size.");
        return;
    }

    $('canvas').remove();
    processText();

    html2canvas($poster, {
      letterRendering: true,
      onrendered: function(canvas) {
        document.body.appendChild(canvas);
        window.oCanvas = document.getElementsByTagName("canvas");
        window.oCanvas = window.oCanvas[0];
        var strDataURI = window.oCanvas.toDataURL();

        var quote = $('blockquote p').first().text().split(' ', 5);
        var filename = convertToSlug(quote.join(' '));

        var a = $("<a>").attr("href", strDataURI).attr("download", "factlist-" + filename + ".png").appendTo("body");

        a[0].click();

        a.remove();

        $('#download').attr('href', strDataURI).attr('target', '_blank');
        $('#download').trigger('click');
      }
    });
}

/*
 * Adjust the poster font size
 */
var adjustFontSize = function(e, size) {
    var newSize = size||$(this).val();

    var fontSize = newSize.toString() + 'px';
    $poster.css('font-size', fontSize);
    if ($fontSize.val() !== newSize){
        $fontSize.val(newSize);
    };
}

/*
 * Select a poster theme
 */
var onThemeClick = function(e) {
    $themeButtons.removeClass().addClass('btn btn-primary');
    $(this).addClass('active');
    $poster.removeClass('poster-news poster-music poster-fresh-air poster-snap-judgement')
                .addClass('poster-' + $(this).attr('id'));
}

/*
 * Select the poster aspect ratio
 */
var onAspectRatioClick = function(e) {
    $aspectRatioButtons.removeClass().addClass('btn btn-primary');
    $(this).addClass('active');
    $poster.removeClass('square sixteen-by-nine').addClass($(this).attr('id'));

    if ($poster.hasClass('sixteen-by-nine')) {
        $fontSize.attr('min', 24);
        $fontSize.val(24);
        adjustFontSize(null, 32);
    } else {
        $fontSize.attr('min', 32);
        $fontSize.val(42);
        adjustFontSize(null, 42);
    }
}

/*
 * Update the kicker text
 */
var onKickerKeyup = function(e) {
    var inputText = $(this).val();
    $kicker.text(inputText);
}

/*
 * Update the timestamp
 */
var onTimeStampKeyup = function(e) {
    var inputText = $(this).val();
    $timestamp.text(inputText);
}

/*
 * Update the show attribution text
 */
var onShowKeyup = function(e) {
    var inputText = $(this).val();
    $showCredit.text(inputText);
}

/*
 * Bind a medium editor to the poster blockquote
 */
var setupMediumEditor = function(){
    var quoteEl = document.querySelectorAll('.poster blockquote');

    var quoteEditor = new MediumEditor(quoteEl, {
        disableToolbar: true,
        placeholder: ''
    });

    $('.poster blockquote').focus();
}

$(onDocumentLoad);
