"use strictct"


let pinTip = document.querySelector(`#pinTip`)
let temporaryTip = document.querySelector(`#temporaryTip`)
let pinMainForm = document.querySelector(`#pinMainForm`) 
let pinInputRow = document.querySelector(`#pinInputRow`)
let pinSaveButton = document.querySelector(`#pinSaveButton`)
let pinShowButton = document.querySelector(`#pinShowButton`)
let pinResetButton = document.querySelector(`#pinResetButton`)
let pinTryButton = document.querySelector(`#pinTryButton`)

let pinCode = [];
let verifiablePinCode = [];
let reg = /[^*]/

if (localStorage.getItem(`pinCode`)) {
  showPinInputCells()
}

function showPinInputCells() {
  pinTryButton.hidden = false;
  pinSaveButton.hidden = true;
  pinInputRow.hidden = true;

  for (let i = 0; i < JSON.parse(localStorage.getItem(`pinCode`)).length; i++) {
    let pinInputCell = document.createElement(`input`)
    pinInputCell.classList.add(`pinInputCell`)
    pinInputCell.setAttribute(`id`,`cell${i}`)
    pinInputCell.addEventListener(`input`, changePinInputCell);
    pinMainForm.append(pinInputCell)
  }



  function changePinInputCell() {

    let target = event.target;
    if (event.inputType == `insertFromPaste`) {
      let pastePinCode = target.value.trim().split(``)
      let cells = pinMainForm.querySelectorAll(`.pinInputCell`);

      for(let i = 0; i < cells.length; i++) {
        cells[i].value = pastePinCode[i]
        cells[i].value = event.target.value.replace(reg, `*`) // 123123
        if (verifiablePinCode.length < 6) {
          verifiablePinCode.push(pastePinCode[i])
        }
        cells[i].focus()
      }
    }
    
    if (event.inputType == `insertText`) {
      if (verifiablePinCode.length < 6) {
        verifiablePinCode.push(event.data)
      }
      target.value = event.target.value.substr(0, 1)
      target.value = event.target.value.replace(reg, `*`)
      
      function focusNextCell() {
        let elemNumber = Number(event.target.getAttribute(`id`).slice(-1))
        let nextElement = pinMainForm.querySelector(`#cell${elemNumber + 1}`)
        if (nextElement) {
          nextElement.focus()
        }
      }
      focusNextCell()
    } else if (event.inputType == `deleteContentBackward`) {

      function focusPreviousCell() {
        let elemNumber = Number(event.target.getAttribute(`id`).slice(-1))

        let previousElement = pinMainForm.querySelector(`#cell${elemNumber - 1}`)

        if (previousElement) {
          previousElement.focus()
        }
      }
      focusPreviousCell() 
      verifiablePinCode.splice(verifiablePinCode.length - 1, 1)
    }
  }



}

function showPinInputRow() {

  let allInputsCells = pinMainForm.querySelectorAll(`.pinInputCell`)

  for (let cell of allInputsCells) {
    cell.remove()
  }

  pinInputRow.hidden = false;
}
    

pinInputRow.addEventListener(`keydown`, savePinCode)
pinSaveButton.addEventListener(`click`, savePinCode)
let showTrigger = false;

function showTip(tip) {
  if (showTrigger) {
    return;
  }
  showTrigger = true;
  let start = Date.now();
  temporaryTip.innerHTML = tip
  temporaryTip.style.opacity = 1;
  temporaryTip.style.top = `30px`;

  function startAnimation() {
    let timer = setInterval(function() {
    
      let timePassed = start - Date.now();
  
      if (timePassed <= -2000) {
        temporaryTip.style.opacity = 0;
        showTrigger = false;
        clearInterval(timer)
        return
      }
      temporaryTip.style.top = parseInt(temporaryTip.style.top) - 1 + `px`
      temporaryTip.style.opacity -= 0.02
    }, 20)
  }
  setTimeout(startAnimation, 400)
}


function savePinCode() {
  if(event.type == `click` || event.code == `Enter`) {
    if (pinCode.length < 4) {
      showTip(`Pin code requires at least 4 characters`)
      return
    }
    localStorage.setItem(`pinCode`, JSON.stringify(pinCode))
    showPinInputCells()
    showTip(`Pin code saved!`)
  }  
}



pinShowButton.addEventListener(`click`, showPinCode)

function showPinCode() {
  if (reg) {
    reg = null;
    pinInputRow.value = pinCode.join(``)
    let allInputsCells = pinMainForm.querySelectorAll(`.pinInputCell`)
    for (let i = 0; i < allInputsCells.length; i++) {
      if(verifiablePinCode[i]) {
        allInputsCells[i].value = verifiablePinCode[i];
      }
    }
    pinShowButton.innerHTML = `<img class="eye" src="https://cdn-icons-png.flaticon.com/512/633/633633.png">`
  } else {    
    reg = /[^*]/
    pinInputRow.value = `*`.repeat(pinInputRow.value.length)
    let allInputsCells = pinMainForm.querySelectorAll(`.pinInputCell`)
    for (let i = 0; i < allInputsCells.length; i++) {
      if(verifiablePinCode[i]) {
        allInputsCells[i].value = `*`;
      }
    }
    pinShowButton.innerHTML = `<img class="eye" src="https://cdn-icons-png.flaticon.com/512/633/633655.png">`
  }
}

pinResetButton.addEventListener(`click`, resetPinCode);

function resetPinCode() {

  showPinInputRow() 
  showTip(`Pin code reset`)
  pinTryButton.hidden = true;
  pinSaveButton.hidden = false;
  localStorage.removeItem(`pinCode`)
  pinInputRow.value = ``
  pinCode = [];
  localStorage.clear()
  
}


pinInputRow.addEventListener(`input`, inputRules)

function inputRules() {

  let target = event.target

  if (event.inputType == `insertFromPaste`) {
    let pastePinCode = target.value.trim().split(``)
    target.value = event.target.value.substr(0, 6)

    for(let i = 0; i < pastePinCode.length; i++) {
      if (pinCode.length < 6) {
        pinCode.push(pastePinCode[i])
        
        console.log(pinCode)
      }
    }
    pinInputRow.value = `*`.repeat(pinCode.length)
  }

  if (event.inputType == `insertText`) {
    if (pinCode.length < 6) {
      pinCode.push(event.data)
    }

    target.value = event.target.value.substr(0, 6)
    target.value = event.target.value.replace(reg, `*`)
  } else if (event.inputType == `deleteContentBackward`) {
    pinCode.pop()
  }
}

pinTryButton.addEventListener(`click`, tryPin) 

function tryPin() {
  let oldPin = JSON.parse(localStorage.getItem(`pinCode`))
  console.log(`oldPin`, oldPin, `verifiablePinCode`, verifiablePinCode)
  let equalParameter = 0;
  
  for(let i = 0; i < oldPin.length; i++) {
    if(verifiablePinCode[i] == oldPin[i]) {
      equalParameter += 1;
    }
  }

  if(equalParameter == oldPin.length) {
    showTip(`Access allowed!`)
    let allInputsCells = pinMainForm.querySelectorAll(`.pinInputCell`)
    for (let i = 0; i < allInputsCells.length; i++) {

      allInputsCells[i].value = ``;

  }
  verifiablePinCode.length = 0;
  } else {
    let allInputsCells = pinMainForm.querySelectorAll(`.pinInputCell`)
    for (let i = 0; i < allInputsCells.length; i++) {

        allInputsCells[i].value = ``;

    }
    showTip(`Access denied : wrong pin code!`)
    verifiablePinCode.length = 0;
  }

  
}




