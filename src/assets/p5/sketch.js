let bg
let song
let fft
preload = () => {
  song = loadSound('/audio/vinyl-textures.mp3')
}

// let bg = 'pink'
setup = () => {
  let canvas = createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)
  canvas.parent('#visualiser')
  fft = new p5.FFT()
}

draw = () => {
  bg = color(window.getComputedStyle(document.body).getPropertyValue('--color-background'))
  fg = color(window.getComputedStyle(document.body).getPropertyValue('--color-text'))
  fg.setAlpha(50)
  // bg.setAlpha(25)
  background(bg)

  let wav = fft.waveform()
  // createLine(wav)
  createCircle(wav)

  noFill()
  stroke(fg)
}

windowResized = () => {
  resizeCanvas(windowWidth, windowHeight)
}

mouseClicked = () => {
  if (song.isPlaying()) {
    song.pause()
    noLoop()
  } else {
    song.play()
    loop()
  }
}

const createCircle = (wav) => {
  push()
  strokeWeight(3)
  translate(width / 2, height / 2)
  for (let t = -1; t <= 1; t += 2) {
    beginShape()
    for (let i = 0; i < 180; i += 0.5) {
      let index = floor(map(i, 0, 180, 0, wav.length))
      let r = map(wav[index], -1, 1, 0, 700)
      let x = r * sin(i) * t
      let y = r * cos(i)

      vertex(x, y)
    }
    endShape()
  }
  pop()
}

const createLine = (wav) => {
  push()
  strokeWeight(2)
  beginShape()
  noFill()
  stroke(fg)
  for (let i = 0; i < width; i++) {
    let index = floor(map(i, 0, width, 0, wav.length))
    let x = i
    let y = wav[index] * 1000 + height / 2

    curveVertex(x, y)
  }
  endShape()
  pop()
}
