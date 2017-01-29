var electron = require('electron');
var remote = electron.remote;

$(function() {

  var filepath;
  if (location.hash) {
    filepath = decodeURIComponent(location.hash.substring(1));
  }
  document.title = (filepath || 'untitled') + ' - MarkDownDiagram';

  new resizebar('#rb', '#edit', 'v', 1);

  var mag = 1.0;
  $('#base')
  .css('width', '2900px')
  .css('height', '2000px');

  $('#zoom').on('input', function() {
    mag = $(this).val() / 100;
    $('#szoom').html('#base {transform: scale(' + mag + ')}');
  })
  $('#size_x,#size_y').on('change', function(ev) {
    $('#base').css(($(this).attr('id') === 'size_x') ? 'width' : 'height', parseInt($(this).val()) + 'px');
  })


  var b = new mdg_draw($('#base'));

  if (filepath) {
    var fs = remote.require('fs');
    fs.readFile(filepath, 'utf-8', function(err, data) {
      if (err) throw err;
      loadSource(data);
    });
  } else {
    var p = loadlocal();
    if (p) {
      loadSource(p.source);
    }
  }

  function loadlocal() {
    var ret = null;
    if (p = window.localStorage.getItem('mdg')) {
      if (JSON.parse(p) && JSON.parse(p).sources) {
        ret = JSON.parse(p).sources[0];
      }
    }
    return ret;
  }

  function savelocal(s) {
    window.localStorage.setItem('mdg', JSON.stringify({
      sources: [s]
    }));
  }

  $('#source').on('keyup', function() {
    var s = $(this).val();
    data = b.parse(s);
    //		console.log(data) ;
    b.setobj(data);
    savelocal({
      'source': s
    });
  })
  $(document).on('dragstart', '#base .box', function(ev) {
    var oe = ev.originalEvent;
    //		console.log('dstart') ;
    //		console.log(oe.pageX+'/'+oe.pageY);
    ev.originalEvent.dataTransfer.setData('text', $(this).attr('id') + '/' + oe.pageX + '/' + oe.pageY);
  })
  $('#base')
  .on('dragenter dragover', function() {
    return false;
  })
  .on('drop', function(ev) {
    //		console.log('drop') ;
    var oe = ev.originalEvent;
    var k = ev.originalEvent.dataTransfer.getData('text').split('/');
    var id = k[0];

    var ox = (oe.pageX - k[1]) / mag;
    var oy = (oe.pageY - k[2]) / mag;
    //		console.log(ox+'/'+oy) ;
    var em = parseInt($('html').css('font-size'));

    var ex = parseInt($('#' + id).css('left'));
    var ey = parseInt($('#' + id).css('top'));
    var px = Math.floor(((ex + ox) / em + 0.25) * 2) / 2;
    var py = Math.floor(((ey + oy) / em + 0.25) * 2) / 2;

    b.setpos(id, px, py);
    b.redraw(data);
    var s = b.upd_text($('#source').val());
    $('#source').val(s);
    savelocal({
      'source': s
    });
    return false;
  })

  function loadSource(source) {
    data = b.parse(source);
    b.setobj(data, true);
    $('#source').val(source);
  }
  $('#b_load').on('click', function() {
    $('#f_load').click();
  })
  $('#f_load').on('change', function(ev) {
    var f = ev.originalEvent.target.files;
    var reader = new FileReader();

    reader.onload = function(e) {
      var src = e.target.result;
      location.hash = encodeURIComponent(f[0].path);
      document.title = f[0].path + ' - MarkDownDiagram';
      $('#source').val(src);
      loadSource(src);
    };
    reader.readAsText(f[0]);
  })
  $('#l_save').on('click', function() {
    const {dialog} = remote;
    var filepath;
    if (location.hash) {
      filepath = decodeURIComponent(location.hash.substring(1));
    } else {
      filepath = dialog.showSaveDialog(
        {
          defaultPath:  require("path").join(process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"], "untitled.mdg")
        }
      );
      if (!filepath) return false;
      location.hash = encodeURIComponent(filepath);
      document.title = filepath + ' - MarkDownDiagram';
    }
    var fs = remote.require('fs');
    fs.writeFile(filepath, $('#source').val(), (err) => {
      if (err) throw err;

    });
    return false;
  })

})


function resizebar(bar, target, hv, dir) {
  this.sw = 0;
  this.sel = target;
  this.dir = dir;
  this.hv = hv;
  this.start = null;
  this.attr = (hv === 'v') ? 'width' : 'height';
  this.mouse = (hv === 'v') ? 'pageX' : 'pageY';
  var self = this;
  $(bar).on('mousedown touchstart', function(ev) {
    self.sw = parseInt($(self.sel).css(self.attr)) - self.dir * ev.originalEvent[self.mouse];
    self.start = self.sel;
  });
  $('body')
  .on('mousemove touchmove', function(ev) {
    if (self.start !== self.sel) return true;
    var w = self.dir * ev.originalEvent[self.mouse] + self.sw;
    if (w < 100) return false;
    $(self.sel).css(self.attr, w + 'px');
    return false;
  })
  .on('mouseup touchend', function() {
    self.start = null;
  })
}