import React, { Component } from 'react'
import { connect } from 'react-redux'
import keydown, { Keys } from 'react-keydown'
import download from 'datauri-download'

import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import { Tabs, Tab } from 'material-ui/Tabs'

import SwipeableViews from 'react-swipeable-views'

import { HostPage } from 'xee-components'
import Chart from 'components/Chart'
import BidsTable from 'components/BidsTable'
import Users from './Users'
import ScreenPage from './ScreenPage'

import { enableScreenPage } from './actions'
import { getPage, getExperimentType } from 'util/index'
import { submitMode } from 'host/actions'
import { updateSetting, updateText } from './actions'

import { ReadJSON } from '../util/ReadJSON'

const pages = ["wait", "description", "auction", "result"]
const ex_types = ["simple", "real"]

const mapStateToProps = ({ mode, loading, buyerBids, sellerBids, deals, highestBid, lowestBid, users, screenPage, ex_type, price_base, price_inc, price_max, price_min, dynamic_text }) => ({
  mode,
  loading,
  buyerBids,
  sellerBids,
  highestBid,
  lowestBid,
  deals,
  users,
  screenPage,
  ex_type,
  price_base,
  price_inc,
  price_max,
  price_min,
  dynamic_text,
})

const { ESC } = Keys

class App extends Component {
  constructor(props, context) {
    super(props, context)
    var dynamic_text = this.props.dynamic_text
    if(!dynamic_text) {
      const { dispatch } = this.props
      dynamic_text = ReadJSON().dynamic_text
      dispatch(updateText(dynamic_text))
    }
    this.state = {
      screenPage: false,
      setting: false,
      edit: false,
      disabled: false,
      slideIndex: 0,
      dynamic_text: dynamic_text,
    }
    this.handleOpenSetting = () => this.setState({
      setting: true,
      ex_type: this.props.ex_type,
      price_base: this.props.price_base,
      price_inc: this.props.price_inc,
      price_max: this.props.price_max,
      price_min: this.props.price_min,
    })
    this.handleOpenEdit = () => this.setState({
      edit: true,
    })
    this.handleSlide = value => this.setState({
      slideIndex: value
    })
    this.handleCloseScreenPage = () => this.setState({
      screenPage: false
    })
    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleDownload = this.handleDownload.bind(this)
  }

  setting() {
    const { ex_type, price_base, price_inc, price_max, price_min  } = this.state
    var buttons = ex_types.map(type => <RaisedButton label={getExperimentType(type)} primary={ex_type == type} onTouchTap={this.handleExChange.bind(this, type)} />)
    return (
      <span>
        {buttons} <br/>
        {(ex_type == 'simple')?
        <span><TextField
          hintText={100}
          value={price_base}
          floatingLabelText={ReadJSON().static_text["price_base"]}
          onChange={this.handleChangeText.bind(this, 'price_base')}
        /><br/>
        <TextField
          hintText={100}
          value={price_inc}
          floatingLabelText={ReadJSON().static_text["price_inc"]}
          onChange={this.handleChangeText.bind(this, 'price_inc')}
        /></span>
        :
        <span><TextField
          hintText={10}
          value={price_min}
          floatingLabelText={ReadJSON().static_text["price_min"]}
          onChange={this.handleChangeText.bind(this, 'price_min')}
        /><span style={{ marginLeft: '5px', marginRight: '5px' }}>～</span>
        <TextField
          hintText={20}
          value={price_max}
          floatingLabelText={ReadJSON().static_text["price_max"]}
          onChange={this.handleChangeText.bind(this, 'price_max')}
        /></span>
         }
      </span>
    )
  }

  handleChangeText(key, event) {
    const value = (event.target.value.length > 0)? parseInt(event.target.value) : 0
    switch(key) {
      case 'price_base': this.setState({ price_base: value }); break;
      case 'price_inc' : this.setState({ price_inc : value }); break;
      case 'price_max' : this.setState({ price_max : value }); break;
      case 'price_min' : this.setState({ price_min : value }); break;
    }
    if(key == 'price_max') this.setState({ disabled: value < this.state.price_min })
    if(key == 'price_min') this.setState({ disabled: this.state.price_max < value }) 
 }

  handleExChange(value) {
    if(this.state.ex_type != value) {
      this.setState({
        ex_type: value,
        price_base: this.props.price_base,
        price_inc: this.props.price_inc,
        price_max: this.props.price_max,
        price_min: this.props.price_min,
        disabled: false,
      })
    }
  }

  handleCloseSetting() {
    const { dispatch } = this.props
    const { ex_type, price_base, price_inc, price_max, price_min  } = this.state
    dispatch(updateSetting({ ex_type: ex_type, price_base: price_base, price_inc: price_inc, price_max: price_max, price_min: price_min }))
    this.setState({ setting: false })
  }

  questionEditer() {
    var tabs = ["説明", "実験", "変数"].map((s, i) => <Tab label={s} value={i} />)
    var desc = (<span>
      <TextField
        hintText={ReadJSON().dynamic_text["desc"][1]}
        defaultValue={this.state.dynamic_text["desc"][1]}
        onBlur={this.handleChangeDynamicText.bind(this, ["desc", 1])}
        multiLine={true}
        fullWidth={true}
      />
      <div style={{ float: "Left", width: "49%" }}><TextField
        hintText={ReadJSON().dynamic_text["desc"][2]}
        defaultValue={this.state.dynamic_text["desc"][2]}
        onBlur={this.handleChangeDynamicText.bind(this, ["desc", 2])}
        multiLine={true}
        fullWidth={true}
        rows={6}
        rowsMax={6}
      /></div>
      <div style={{ float: "Right", width: "49%" }}><TextField
        hintText={ReadJSON().dynamic_text["desc"][3]}
        defaultValue={this.state.dynamic_text["desc"][3]}
        onBlur={this.handleChangeDynamicText.bind(this, ["desc", 3])}
        multiLine={true}
        fullWidth={true}
        rows={6}
        rowsMax={6}
      /></div>
      <div style={{ clear: "both" }}><TextField
        hintText={ReadJSON().dynamic_text["desc"][4]}
        defaultValue={this.state.dynamic_text["desc"][4]}
        onBlur={this.handleChangeDynamicText.bind(this, ["desc", 4])}
        multiLine={true}
        fullWidth={true}
      /></div>
    </span>)
    var ex = (<span>
      <div style={{ float: "Left", width: "49%" }}><TextField
        hintText={ReadJSON().dynamic_text["your_buyer"]}
        defaultValue={this.state.dynamic_text["your_buyer"]}
        onBlur={this.handleChangeDynamicText.bind(this, ["your_buyer"])}
        multiLine={true}
        fullWidth={true}
        rows={7}
        rowsMax={7}
      /></div>
      <div style={{ float: "Right", width: "49%" }}><TextField
        hintText={ReadJSON().dynamic_text["your_seller"]}
        defaultValue={this.state.dynamic_text["your_seller"]}
        onBlur={this.handleChangeDynamicText.bind(this, ["your_seller"])}
        multiLine={true}
        fullWidth={true}
        rows={7}
        rowsMax={7}
      /></div>
    </span>)

    var variables = (<div>
      {Object.keys(this.state.dynamic_text["variables"]).map((key, i) =>
        <div style={{ width: "49%", float: (i % 2 == 0)? "Left" : "Right" }}>
         <TextField
           hintText={key}
           defaultValue={this.state.dynamic_text["variables"][key]}
           onBlur={this.handleChangeDynamicText.bind(this, ["variables", key])}
          />
        </div>
      )}
    </div>)

    return (<span>
      <Tabs
        onChange={this.handleSlide}
        value={this.state.slideIndex}
      >
        {tabs}
      </Tabs>
      <SwipeableViews
        index={this.state.slideIndex}
        onChangeIndex={this.handleSlide}
      >
        {desc}
        {ex}
        {variables}
      </SwipeableViews>
    </span>)
  }

  handleChangeDynamicText(value, event){
    var dynamic_text = Object.assign({}, this.state.dynamic_text)
    var temp = dynamic_text
    for(var i = 0; i < value.length - 1; i++){
      temp = temp[value[i]]
    }
    temp[value[value.length - 1]] = event.target.value
    this.setState({ dynamic_text: dynamic_text })
  }

  handleCloseEdit() {
    const { dispatch } = this.props
    dispatch(updateText(this.state.dynamic_text))
    this.setState({
      edit: false,
      slideIndex: 0,
    })
  }

  handleChangePage(page) {
    this.props.dispatch(submitMode(page))
  }

  handleDownload() {
    const { users, deals } = this.props
    const fileName = "double_auction.csv"
    const list = [
      ["Double Auction"],
      ["Date and time", new Date()],
      ["The number of participants", Object.keys(users).length],
      ["ID", "Role", "Money", "Bit", "Deal"],
      ...(Object.keys(users).map(id => {
        const user = users[id]
        return [id, user.role, user.money, user.bid, user.deal]
      })),
      [],
      ["Deal", "ID1", "ID2", "time"],
      ...(deals.map(deal => {
        return [
          deal.deal,
          deal.participant_id,
          deal.participant_id2,
          deal.time,
        ]
      }))
    ]
    const content = list.map(line => line.join(',')).join("\n")
    download(fileName, 'text/csv;charset=utf-8', content)
  }

  componentWillReceiveProps({ keydown, mode: nextPage }) {
    if (keydown.event && keydown.event.which == ESC) {
      this.setState({
        screenPage: false
      })
    }
    if (this.props.mode !== nextPage) {
      if(nextPage === 'result') {
        Materialize.toast(ReadJSON().static_text["push_esc"], 5000, 'rounded')
        this.setState({
          screenPage: true
        })
      }
    }
  }

  componentDidMount() {
    sendData("fetch_contents")
  }

  render() {
    const { mode, loading, buyerBids, sellerBids, deals, highestBid, lowestBid, users, dynamic_text } = this.props
    if (this.state.screenPage) {
      return (
        <div>
          <ScreenPage />
          <RaisedButton
            label={ReadJSON().static_text["back_top"]}
            onTouchTap={this.handleCloseScreenPage}
            style={{
              marginTop: "5%",
            }}
          />
        </div>
      )
    } else {
      return (
        <HostPage
          page={mode}
          getPageName={getPage}
          pages={pages}
          changePage={this.handleChangePage}
          openSettingDialog={this.handleOpenSetting}
          openEditDialog={this.handleOpenEdit}
          downloadFile={this.handleDownload}
          loading={loading}
          settingButton={mode == "wait"}
          editButton={mode == "wait"}
          downloadButton={mode == "result"}
        >
          <div style={{ marginTop: "5%" }}>
            <Users />
          </div>
          <Divider
            style={{
              marginTop: "5%",
            }}
          />
          <BidsTable
            buyerBids={buyerBids}
            sellerBids={sellerBids}
            deals={deals}
            highestBid={highestBid}
            lowestBid={lowestBid}
            expanded={false}
            dynamic_text={dynamic_text}
          />
          <Divider
            style={{
              marginTop: "5%",
            }}
          />
          <Chart
            users={users}
            deals={deals}
            expanded={false}
            dynamic_text={dynamic_text}
          />
          <Dialog
            title={ReadJSON().static_text["option"]}
            actions={[
              <RaisedButton
                label={ReadJSON().static_text["apply"]}
                primary={true}
                onTouchTap={this.handleCloseSetting.bind(this)}
                disabled={this.state.disabled}
              />
            ]}
            model={false}
            open={this.state.setting}
            autoScrollBodyContent={true}
          >
            {this.setting()}
          </Dialog>
          <Dialog
            title={ReadJSON().static_text["edit"]}
            actions={[
              <RaisedButton
                label={ReadJSON().static_text["apply"]}
                primary={true}
                onTouchTap={this.handleCloseEdit.bind(this)}
              />
            ]}
            model={false}
            open={this.state.edit}
            autoScrollBodyContent={true}
          >
            {this.questionEditer()}
          </Dialog>
        </HostPage>
      )
    }
  }
}

export default connect(mapStateToProps)(keydown(App))
