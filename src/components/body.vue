<template>
  <div class="full-calendar-body" ref="calendarbody">
    <div class="weeks">
      <strong class="week" v-for="week, wIndex in weekNames" :key="wIndex">{{week}}</strong>
    </div>
    <div class="dates" ref="dates">
      <div class="dates-bg">
        <div class="week-row" v-for="week, wIndex in currentDates" :key="wIndex">
          <div class="day-cell" v-for="day, dIndex in week" :key="dIndex"
            :class="{'today' : day.isToday,
              'not-cur-month' : !day.isCurMonth}">
            <p class="day-number">{{day.monthDay}}</p>
          </div>
        </div>
      </div>

      <!-- absolute so we can make dynamic td -->
      <div class="dates-events">
        <div class="events-week" v-for="week, wIndex in currentDates" :key="wIndex">
          <div class="events-day" v-for="day, dIndex in week" track-by="$index" :key="dIndex"
            :class="{'today' : day.isToday,
              'not-cur-month' : !day.isCurMonth}" @click.stop="dayClick(day.date, $event)">
            <p class="day-number">{{day.monthDay}}</p>
            <div class="event-box">
              <p class="event-item" v-for="event, eIndex in day.events" :key="eIndex" v-show="event.cellIndex <= eventLimit"
                 :class="[classNames(event.cssClass), {
                  'is-start'   : isStart(event.start, day.date),
                  'is-end'     : isEnd(event.end,day.date),
                  'is-opacity' : !event.isShow
                  }]" 
                  :style="{'background-color': `${event.color} !important`}"
                @click="eventClick(event,$event)" :title="event.title">
                <span class="level-icon" v-if="isBegin(event, day.date, day.weekDay) != '　'">✔</span>
                {{isBegin(event, day.date, day.weekDay)}}
              </p>
              <p v-if="day.events.length > eventLimit"
                class="more-link" @click.stop="selectThisDay(day, $event)">
                + {{day.events[day.events.length -1].cellIndex - eventLimit}} 更多
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- full events when click show more -->
      <div class="more-events" v-show="showMore"
        :style="{left: morePos.left + 'px', top: morePos.top + 'px'}">
        <div class="more-header">
          <span class="more-title">{{moreTitle(selectDay.date)}}</span>
          <span class="more-close" @click.stop="showMore = false">x</span>
        </div>
        <div class="more-body">
          <ul class="body-list">
            <li v-for="event, eIndex in selectDay.events" :key="eIndex"
              v-show="event.isShow" class="body-item"
              @click="eventClick(event,$event)">
              {{event.title}}
            </li>
          </ul>
        </div>
      </div>

      <div class="add-edit-dialog" v-show="showDialog"
        :style="{left: dialogPos.left + 'px', top: dialogPos.top + 'px'}">
        <div class="add-edit-header">
          <span class="dialog-title">{{ dialogTitle }}</span>
          <span class="dialog-close" @click.stop="close">x</span>
        </div>
        <div class="add-edit-body">
          <slot name="body-dialog">
          </slot>
        </div>
      </div>

      <slot name="body-card">

      </slot>

    </div>
  </div>
</template>
<script type="text/babel">
  import dateFunc from './dateFunc'

  export default {
    props : {
      currentDate : {},
      events      : {},
      weekNames   : {
        type : Array,
        default : []
      },
      showDialog  : {
        type: Boolean,
        default : false,
      },
      monthNames  : {},
      firstDay    : {}
    },
    created () {
      this.events.forEach((item, index) => {
        item._id = item.id || index
        item.end = item.end || item.start
      })
      // this.events = events
    },
    data () {
      return {
        // weekNames : DAY_NAMES,
        weekMask : [1,2,3,4,5,6,7],
        // events : [],
        isLismit : true,
        eventLimit : 2,
        showMore : false,
        dialogTitle: undefined,
        morePos : {
          top: 0,
          left : 0
        },
        dialogPos : {
          top: 0,
          left : 0
        },
        selectDay : {}
      }
    },
    watch : {
      weekNames (val) {
        // console.log('watch weekNames', val)
      }
    },
    computed : {
      currentDates () {
        return this.getCalendar()
      }
    },
    methods : {
      isBegin (event, date, index) {
        let st = new Date(event.start)

        if (index == 0 || st.toDateString() == date.toDateString()) {
          return event.title
        }
        return '　'
      },
      moreTitle (date) {
        let dt = new Date(date)
        return this.weekNames[dt.getDay()] + ', ' + this.monthNames[dt.getMonth()] + dt.getDate()
      },
      classNames (cssClass) {
        if(!cssClass) return ''
        // string  
        if (typeof cssClass == 'string') return cssClass

        // Array
        if (Array.isArray(cssClass)) return cssClass.join(' ')
        
        // else
        return ''
      },
      getCalendar () {
        // calculate 2d-array of each month
        // first day of this month
        let now = new Date() // today
        let current = new Date(this.currentDate)

        let startDate = dateFunc.getStartDate(current) // 1st day of this month

        let curWeekDay = startDate.getDay()

        // begin date of this table may be some day of last month
        let diff = parseInt(this.firstDay) - curWeekDay
        diff = diff > 0 ? (diff - 7) : diff

        startDate.setDate(startDate.getDate() + diff)
        let calendar = []

        for(let perWeek = 0 ; perWeek < 6 ; perWeek++) {

          let week = []

          for(let perDay = 0 ; perDay < 7 ; perDay++) {
            week.push({
              monthDay : startDate.getDate(),
              isToday : now.toDateString() == startDate.toDateString(),
              isCurMonth : startDate.getMonth() == current.getMonth(),
              weekDay : perDay,
              date : new Date(startDate),
              events : this.slotEvents(startDate)
            })

            startDate.setDate(startDate.getDate() + 1)
            // if (startDate.toDateString() == endDate.toDateString()) {
            //   isFinal = true
            //   break
            // }
          }
          calendar.push(week)
          // if (isFinal) break
        }
        return calendar
      },
      slotEvents (date) {

        // find all events start from this date
        let cellIndexArr = []
        let thisDayEvents = this.events.filter(day => {
          let dt = new Date(day.start)
          let st = new Date(dt.getFullYear(),dt.getMonth(),dt.getDate())
          let ed = day.end ? new Date(day.end) : st
          // console.log('slotEvt', st, ed, date)
          return date>=st && date<=ed
        })

        // sort by duration
        thisDayEvents.sort((a,b)=>{
          if(!a.cellIndex) return 1
          if (!b.cellIndex) return -1
          return a.cellIndex - b.cellIndex
        })

        // mark cellIndex and place holder
        for (let i = 0;i<thisDayEvents.length;i++) {
          thisDayEvents[i].cellIndex = thisDayEvents[i].cellIndex || (i + 1)
          thisDayEvents[i].isShow = true
          if (thisDayEvents[i].cellIndex == i+1 || i>2) continue
          thisDayEvents.splice(i,0,{
            title : 'holder',
            cellIndex : i+1,
            start : dateFunc.format(date,'yyyy-MM-dd'),
            end : dateFunc.format(date,'yyyy-MM-dd'),
            isShow : false
          })
        }

        return thisDayEvents
      },
      isStart (eventDate, date) {
        let st = new Date(eventDate)
        return st.toDateString() == date.toDateString()
      },
      isEnd (eventDate,date) {
        let ed = new Date(eventDate)
        return ed.toDateString() == date.toDateString()
      },
      selectThisDay (day, jsEvent) {
        this.selectDay = day
        this.showMore = true
        this.morePos = this.computePos(event.target)
        this.morePos.top -= 100
        let events = day.events.filter(item =>{
          return item.isShow == true
        })
        this.$emit('moreclick', day.date, events, jsEvent)
      },
      computePos (target) {
        let eventRect = target.getBoundingClientRect()
        let pageRect = this.$refs.dates.getBoundingClientRect()
        return {
          left : eventRect.left - pageRect.left,
          top  : eventRect.top + eventRect.height - pageRect.top
        }
      },
      dayClick(day, jsEvent) {
        this.dialogPos = this.computePos(jsEvent.target)
        
        let screenWidth = this.$refs.calendarbody.clientWidth + 40;
        let screenHeight = this.$refs.calendarbody.clientHeight + 120;
      
        if ((this.dialogPos.left + 340) > screenWidth) {
          this.dialogPos.left -= 280;
        } else {
          this.dialogPos.left += 60
        }
        console.log(screenHeight, this.dialogPos.top);
        if ((this.dialogPos.top + 420) > screenHeight) {
          this.dialogPos.top -= 480
        } else {
          this.dialogPos.top -= 120
        }

        this.dialogTitle = '新增日程';
        this.$emit('dayclick', day, jsEvent)
      },
      eventClick(event, jsEvent) {
        if (!event.isShow) {
          return
        }
        this.dialogPos = this.computePos(jsEvent.target)

        let screenWidth = this.$refs.calendarbody.clientWidth + 40;
        let screenHeight = this.$refs.calendarbody.clientHeight + 120;

        if ((this.dialogPos.left + 340) > screenWidth) {
          this.dialogPos.left -= 280;
        } else {
          this.dialogPos.left += 60
        }
        if ((this.dialogPos.top + 420) > screenHeight) {
          this.dialogPos.top -= 480
        } else {
          this.dialogPos.top -= 120
        }
        this.dialogTitle = '查看日程';
        jsEvent.stopPropagation()
        let pos = this.computePos(jsEvent.target)
        this.$emit('eventclick', event, jsEvent, pos)
      },
      close() {
        this.$emit('close', false);
      },
    }
  }
</script>
<style lang="scss">
.full-calendar-body{
  margin-top: 20px;
  .weeks{
    display: flex;
    border-top:1px solid #e0e0e0;
    border-bottom:1px solid #e0e0e0;
    border-left:1px solid #e0e0e0;
    .week{
      flex:1;
      text-align: center;
      border-right:1px solid #e0e0e0;
    }
  }
  .dates {
    position:relative;
    .week-row{
      // width: 100%;
      // position:absolute;
      border-left:1px solid #e0e0e0;
      display: flex;
      .day-cell{
        flex:1;
        min-height: 120px;
        padding:4px;
        border-right:1px solid #e0e0e0;
        border-bottom:1px solid #e0e0e0;
        .day-number{
          text-align: right;
        }
        &.today{
          background-color:#eef5ff;
        }
        &.not-cur-month{
          .day-number{
            color:rgba(0,0,0,.24);
          }
        }
      }
    }
    .dates-events{
      position:absolute;
      top:0;
      left:0;
      z-index:1;
      width: 100%;
      .events-week{
        display: flex;
        .events-day{
          cursor: pointer;
          flex:1;
          min-height: 130px;
          overflow: hidden;
          text-overflow: ellipsis;
          .day-number{
            text-align: right;
            padding:4px 5px 4px 4px;
            opacity: 0;
          }
          &.not-cur-month{
            .day-number{
              color:rgba(0,0,0,.24);
            }
          }
          .event-box{
            .event-item{
              cursor: pointer;
              font-size:12px;
              background-color:#C7E6FD;
              margin-bottom:2px;
              color: rgba(0,0,0,.87);
              padding:0 0 0 4px;
              height: 36px;
              line-height: 36px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              &.is-start{
                margin-left: 4px;
                border-top-left-radius: 18px;
                border-bottom-left-radius: 18px;
              }
              &.is-end{
                margin-right: 4px;
                border-top-right-radius: 18px;
                border-bottom-right-radius: 18px;
              }
              &.is-opacity{
                opacity: 0;
              }

              .level-icon {
                color: #fff;
                padding: 5px 8px;
                background-color: #5aad73;
                border-radius: 50%;
              }
            }
            .more-link{
              cursor: pointer;
              // text-align: right;
              padding-left: 8px;
              padding-right: 2px;
              color: rgba(0,0,0,.38);
              font-size: 14px;
            }
          }
        }
      }
    }
    .more-events{
      position:absolute;
      width: 150px;
      z-index: 2;
      border:1px solid #eee;
      box-shadow: 0 2px 6px rgba(0,0,0,.15);
      .more-header{
        background-color:#eee;
        padding:5px;
        display: flex;
        align-items : center;
        font-size: 14px;
        .more-title{
          flex:1;
        }
        .more-close{
          margin-right: 2px;
          cursor: pointer;
          font-size: 16px;
        }
      }
      .more-body{
        height: 140px;
        overflow: hidden;
        .body-list{
          height: 120px;
          padding:5px;
          overflow: auto;
          background-color:#fff;
          .body-item{
            cursor: pointer;
            font-size:12px;
            background-color:#C7E6FD;
            margin-bottom:2px;
            color: rgba(0,0,0,.87);
            padding:0 0 0 4px;
            height: 18px;
            line-height: 18px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

    .add-edit-dialog{
      position:absolute;
      width: 340px;
      z-index: 2;
      border:1px solid #eee;
      box-shadow: 0 2px 6px rgba(0,0,0,.15);
      .add-edit-header{
        background-color: #0068b1;
        color: #fff;
        padding: 10px 5px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        display: flex;
        align-items : center;
        font-size: 16px;
        text-align: center;
        .dialog-title{
          flex:1;
        }
        .dialog-close{
          margin-right: 2px;
          cursor: pointer;
          font-size: 16px;
        }
      }
      .add-edit-body{
        // height: 280px;
        padding: 10px;
        overflow: hidden;
        background-color: #fff;
        border-bottom-left-radius: 6px;
        border-top-right-radius: 6px;
        .body-list{
          height: 120px;
          padding:5px;
          overflow: auto;
          background-color:#fff;
          .body-item{
            cursor: pointer;
            font-size:12px;
            background-color:#C7E6FD;
            margin-bottom:2px;
            color: rgba(0,0,0,.87);
            padding:0 0 0 4px;
            height: 18px;
            line-height: 18px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }

  }
}
</style>
