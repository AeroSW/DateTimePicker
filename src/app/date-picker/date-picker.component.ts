import {Component, OnInit, Input} from '@angular/core';
import {ASWDate, DateState} from './aerosw-date';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'app-date-picker',
    templateUrl: './date-picker.component.html',
    styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
    dates: Array<Array<ASWDate>>;
    public static readonly days: object[] = [
        {"name": "Sunday", "abbr": "Sun"},
        {"name": "Monday", "abbr": "Mon"},
        {"name": "Tuesday", "abbr": "Tue"},
        {"name": "Wednesday", "abbr": "Wed"},
        {"name": "Thursday", "abbr": "Thu"},
        {"name": "Friday", "abbr": "Fri"},
        {"name": "Saturday", "abbr": "Sat"}
    ];
    private static readonly months: object[] = [
        {"name": "January", "abbr": "Jan"},
        {"name": "February", "abbr": "Feb"},
        {"name": "March", "abbr": "Mar"},
        {"name": "April", "abbr": "Apr"},
        {"name": "May", "abbr": "May"},
        {"name": "June", "abbr": "Jun"},
        {"name": "July", "abbr": "Jul"},
        {"name": "August", "abbr": "Aug"},
        {"name": "September", "abbr": "Sep"},
        {"name": "October", "abbr": "Oct"},
        {"name": "November", "abbr": "Nov"},
        {"name": "December", "abbr": "Dec"}
    ];
    current_month: number;
    current_year: number;
    selected_datetime: Date;
    display_calendar: boolean;
    
    @Input() myControl: FormControl;
    
    constructor() {}

    ngOnInit() {
        this.selected_datetime = new Date();
        this.display_calendar = false;
        this.current_month = this.selected_datetime.getMonth();
        this.current_year = this.selected_datetime.getFullYear();
        this.getDays(this.current_year);
        if(this.myControl == null) {
            console.log('setting myControl')
            this.myControl = new FormControl("");
        }
    }
    get DaysOfWeek() {
        return DatePickerComponent.days;
    }
    get MonthsOfYear() {
        return DatePickerComponent.months;
    }
    toggleCalendar() {
        this.display_calendar = !this.display_calendar;
    }
    isSelectable(asw_date: ASWDate) {
        return (asw_date.state === DateState.CURRENT &&
            (this.current_month != this.selected_datetime.getMonth() ||
            this.current_year != this.selected_datetime.getFullYear() ||
            asw_date.date !== this.selected_datetime.getDate())
        );
    }
    isSelected(asw_date: ASWDate) {
        return (this.current_year === this.selected_datetime.getFullYear() &&
            this.current_month === this.selected_datetime.getMonth() && 
            asw_date.date === this.selected_datetime.getDate()
        )
    }
    selectDate(asw_date: ASWDate) {
        this.selected_datetime = new Date(this.current_year, this.current_month, asw_date.date);
        let date_str = ("0" + (this.selected_datetime.getMonth() + 1)).slice(-2) + "/" +
            ("0" + this.selected_datetime.getDate()).slice(-2) + "/" +
            this.selected_datetime.getFullYear();
        this.myControl.setValue(date_str);
        this.display_calendar = false;
    }
    updateMonth(adj: number) {
        if(adj === -1 || adj === 1) {
            this.current_month += adj;
            if(this.current_month < 0) {
                this.current_month = 11;
                this.current_year--;
            }
            else if(this.current_month > 11) {
                this.current_month = 0;
                this.current_year++;
            }
            this.getDays(this.current_year, this.MonthsOfYear[this.current_month]["name"]);
        }
    }
    isInputEmpty() {
        return (this.myControl.value === null || this.myControl.value === "");
    }
    formatInput() {
        try {
            let temp_date = new Date(this.myControl.value);
            if(temp_date instanceof Date && isNaN(temp_date.valueOf())) throw "Invalid date entered.";
            this.selected_datetime = temp_date;
            let date_str = ("0" + (this.selected_datetime.getMonth() + 1)).slice(-2) + "/" +
                ("0" + this.selected_datetime.getDate()).slice(-2) + "/" +
                this.selected_datetime.getFullYear();
            this.myControl.setValue(date_str);
        } catch(ex) {
            this.myControl.reset();
        }
    }
    
    private getDays(year: number, month_name: string = null) {
        this.dates = [];
        // Find the month index.
        let ind = new Date().getMonth();
        if(month_name) {
            ind = DatePickerComponent.months.findIndex(value => value["name"] === month_name);
            if(ind === -1) return;
        }
        
        let dt = new Date(year, ind, 1); // Get first day of selected month and year.
        let last_date = new Date(year, ind, 0).getDate(); // Get last date of previous month.
        let next_month = (ind === 11) ? 0 : ind + 1; // If current month is december, wrap to January.
        let next_month_year = (next_month === 0) ? year + 1 : year;
        let last_day = new Date(next_month_year, next_month, 0);
        
        let day_index = dt.getDay(); // Get day of week.
        let week: ASWDate[] = [];
        // Offset date subtraction by 1, gives us correct numbers.
        for(let di = last_date - day_index; di < last_date; di++){
            let asw_date: ASWDate = {
                state: DateState.OOB,
                date: di + 1
            };
            week.push(asw_date);
        } // Records any previous dates of the first week.
        let curr_date_index = dt.getDate();
        for(let di = curr_date_index; di <= last_day.getDate(); di++){
            let day_offset = (di - 1 + day_index) % 7;
            if(week.length === 7 && day_offset === 0) {
                this.dates.push(week);
                week = []; // Reset week for next round.
            }
            let asw_date: ASWDate = {
                state: DateState.CURRENT,
                date: di
            };
            week.push(asw_date);
        }
        // Fill out the rest of the days for the last week.
        if(week.length < 7 && week.length > 0) {
            let last_day_of_week = last_day.getDay();
            for(let ii = last_day_of_week + 1; ii < 7; ii++){
                let asw_date: ASWDate = {
                    state: DateState.OOB,
                    date: ii - last_day_of_week
                };
                week.push(asw_date);
            }
        }
        if(week.length === 7) { // Push the last week.
            this.dates.push(week);
        }
    }
}
