import React from 'react' 
import storage from '../storage'
import '../styles/css/main.css'
let keywords = {"var" : "var", "function" : "function", "class" : "class"}
let quotes = ['"',"'"]

let parseObject = (word,obj) =>{
  let index = word.indexOf('.')
  if(typeof obj !== "object"){
    return []
  } else if(index<=0) {
    return Object.keys(obj).filter(key=>{
      let match
      try{
        match = key.match(word)
      } catch (e){
        //mute regex error
      }
      return match
    })
  }
  let currentObjKey = word.substring(0,index)
  let currentObj = obj[currentObjKey]
  return parseObject(word.substring(index+1),currentObj)
}

export default class App extends React.Component{
  state = {code: "", suggestions: []}

  handleInput = (e) => {
    //get code input and save code, currentword to state
    let code = e.target.value
    let start = e.target.selectionStart
    let currentWord = code.substring(code.lastIndexOf(" ", start) + 1).replace(/\n/g," ")
    currentWord = currentWord.substring(currentWord.lastIndexOf(" ", start) + 1)
    this.suggestWord(currentWord)
    this.setState({code, currentWord}, ()=>{
      this.renderCode()
    })
  }

  handleTab = (e) => {
    //allow tab indentation and autocompletion
    if(e.keyCode === 9 ){
      e.preventDefault();
      if(this.state.suggestions.length){
        this.typeAhead(this.state.suggestions[0])
      }else{
        let textArea = e.target
        let start = textArea.selectionStart
        let end = textArea.selectionEnd
        let value = textArea.value 
        textArea.value = value.substring(0, start)
                    + "  "
                    + value.substring(end)
        textArea.selectionStart = textArea.selectionEnd = start + 2;
        this.setState({code: textArea.value})
      }
    }
  }

  suggestWord = (w) => {
    //get suggestions for current word
    let suggestions = []
    if(w){
      let objIndex = w.indexOf('.')
      if(objIndex > 0){
        suggestions = parseObject(w,storage)
      }else{
        suggestions = Object.keys(keywords).filter(keyword=>{
          let match
          try{
            match = keyword.match(w)
          } catch (e){
            //mute regex error
          }
          return match
        })
      }
    }
    this.setState({suggestions})
  }

  typeAhead = (currentWord) =>{
    //autocomplete current word
    let code = this.state.code
    let index = Math.max(code.lastIndexOf(" "),code.lastIndexOf("\n"),code.lastIndexOf("."))
    code = code.slice(0, index+1) + currentWord
    let textArea = document.getElementById('inputText')
    textArea.value = code
    this.setState({currentWord, code}, ()=>{
      //refocus and clear suggestions
      textArea.focus()
      this.setState({suggestions:[]})
    })
  }

  renderCode = () => {
    //convert user code into lines and rerender on editor
    let code = this.state.code
    let lines = code.split("\n")
    return (
      lines.map(line => this.renderLine(line))
    )
  }

  renderLine = (s) => {
    //split all spaces, 1 single quote, 1 double quote into separate words
    let words = s.split(/(\s+|'|"|;)/)
    let quote = false
    return (
      <div className="line">
        {words.map(word => this.renderWord(word, quote, (isQuote) => {
          if(isQuote) quote = !quote
        }))}
      </div>
    ) 
  }

  renderWord = (w, quote, cb) => {
    //check type of word and return highlighted type
    if(quote && !quotes.includes(w[0])){
      return (
        <span style={{color:"orange"}}>{w}</span>
      )
    }else if(keywords[w]){
      return (
        <span style={{color:"green"}}>{w}</span>
      )
    }else if(Number(w)){
      return (
        <span style={{color:"blue"}}>{w}</span>
      )
    }else if(quotes.includes(w[0])){
      cb(true)
      return (
        <span style={{color:"orange"}}>{w}</span>
      )
    }else{
      return (
        <span>{w}</span>
      )
    }
  }

  render(){
    return(
      <div className="container">
        <div className="header">SlyceCode</div>
        <div className="editor-container">
          <div className="editor-wrapper">
            <textarea className="editor left" id="inputText" onChange={this.handleInput} onKeyDown={this.handleTab} placeholder="Code here" wrap="off" autoFocus></textarea>
          </div>
          <div className="editor-wrapper">
            <div className="editor right">
              {this.renderCode()}
            </div>
          </div>  
        </div>
        <div className="suggestion-container">
          <div className="title">Suggestion</div>
          {this.state.suggestions.map(suggestion=>(
            <div className="suggestion" onClick={()=>this.typeAhead(suggestion)}>{suggestion}</div>
          ))}
        </div>
      </div>
    )
  }
}