// @flow
import {
  VirtualizedList,
  View,
  TouchableOpacity,
  Image,
  Text,
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';

import styleConstructor from './style';

import DayView from './DayView';
import {HEIGHT_PER_MINUTE} from './constants';

export default class EventCalendar extends React.Component {
  static dateByIndex(index, initDate, size) {
    return moment.utc(initDate).add(index - size, 'days').format('YYYY-MM-DD');
  }

  constructor(props) {
    super(props);
    const start = props.start || 0;
    const end = props.end || 24;
    this.calendarStyle = styleConstructor(props.styles, (end - start) * 60 * HEIGHT_PER_MINUTE);

    this.calendarRef = React.createRef();
    this.getItem = this.getItem.bind(this);
    this.getItemLayout = this.getItemLayout.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.scrollEndHandler = this.scrollEndHandler.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  getItem(eventList, index) {
    const { initDate, size } = this.props;
    const item = eventList[EventCalendar.dateByIndex(index, initDate, size)] || [];
    return item;
  }

  getItemLayout(data, index) {
    const { width } = this.props;
    return { length: width, offset: width * index, index };
  }

  goToDate(date) {
    const { initDate, size } = this.props;
    const earliestDate = moment.utc(initDate).subtract(size, 'days');
    const index = moment.utc(date).diff(earliestDate, 'days');
    this.goToPage(index);
  }

  goToPage(index) {
    const { size } = this.props;
    if (index <= 0 || index >= size * 2) return;
    this.calendarRef.current.scrollToIndex({ index, animated: false });
  }

  scrollEndHandler(event) {
    const {
      width, initDate, size, onDateChange,
    } = this.props;
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const date = EventCalendar.dateByIndex(index, initDate, size);
    if (onDateChange) onDateChange(date);
  }

  renderItem({ index, item }) {
    const {
      initDate, size, formatHeader, width,
      format24h, headerStyle, renderEvent, onEventTapped, scrollToFirst, start, end,
      refreshControl, startKey, endKey
    } = this.props;
    const date = EventCalendar.dateByIndex(index, initDate, size);

    return (
      <View style={[this.calendarStyle.container, { width }]}>
        <DayView
          date={date}
          index={index}
          format24h={format24h}
          formatHeader={formatHeader}
          headerStyle={headerStyle}
          renderEvent={renderEvent}
          onEventTapped={onEventTapped}
          events={item}
          width={width}
          styles={this.calendarStyle}
          scrollToFirst={scrollToFirst}
          start={start}
          end={end}
          refreshControl={refreshControl}
          startKey={startKey}
          endKey={endKey}
        />
      </View>
    );
  }

  render() {
    const { width, size, events } = this.props;
    return (
      <View style={[this.calendarStyle.container, { width }]}>
        <VirtualizedList
          ref={this.calendarRef}
          windowSize={3}
          initialNumToRender={3}
          initialScrollIndex={size}
          data={events}
          getItemCount={() => size * 2}
          getItem={this.getItem}
          keyExtractor={(item, index) => index.toString()}
          getItemLayout={this.getItemLayout}
          horizontal
          pagingEnabled
          renderItem={this.renderItem}
          style={{ width }}
          onScroll={this.scrollEndHandler}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
}

EventCalendar.defaultProps = {
  end: 24,
  format24h: true,
  formatHeader: 'DD MMMM YYYY',
  initDate: new Date(),
  scrollToFirst: true,
  size: 30,
  start: 0,
  upperCaseHeader: false,
  onDateChange: null,
};
