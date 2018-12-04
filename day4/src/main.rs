extern crate chrono;

use std::collections::HashMap;
use chrono::prelude::*;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

enum Action {
    BeginsShift,
    FallsAsleep,
    WakesUp,
}

struct LogEntry {
    time: chrono::DateTime<Utc>,
    guard_id: u32,
    action: Action,
}

fn main() {
    let raw_input = open_problem_file();
    let parsed_input = parse_input(&raw_input[..]);
    let (sleep_map, minutes_slept) = get_sleep_maps(&parsed_input);
    let (guard, minute) = get_sleepy_guard_minute(&sleep_map, &minutes_slept);
    let solution_1 = guard*minute;
    println!("solution 1: {}", solution_1);
    let (guard, minute) = get_most_slept_minute(&sleep_map);
    let solution_2 = guard*minute;
    println!("solution 2: {}", solution_2);
}

fn get_sleep_maps(input: &Vec<LogEntry>) -> (HashMap<u32, Vec<u32>>, HashMap<u32, u32>) {
    // make a map of guard_id -> vector of minutes asleep
    let mut sleep_map: HashMap<u32, Vec<u32>> = HashMap::new();
    // also make a map of guard_id -> minutes slept for later
    let mut minutes_slept: HashMap<u32, u32> = HashMap::new();
    // iterate through sorted vector of log entries
    for i in 0..input.len() {
        let current_entry = &input[i];
        match current_entry.action {
            Action::FallsAsleep => {
                let minute = current_entry.time.minute() as usize;
                // next entry should be when the guard woke up
                let next_entry = &input[i+1];
                match next_entry.action {
                    Action::WakesUp => {
                        let wake_up_minute = next_entry.time.minute() as usize;
                        for m in minute..wake_up_minute {
                            *minutes_slept.entry(current_entry.guard_id).or_insert(0) += 1;
                            sleep_map.entry(current_entry.guard_id).or_insert(vec![0; 60])[m] += 1;
                        }
                    },
                    _ => {},
                };
            },
            _ => {},
        };
    }
    (sleep_map, minutes_slept)
}

fn get_sleepy_guard_minute(sleep_map: &HashMap<u32, Vec<u32>>, minutes_slept: &HashMap<u32, u32>) -> (u32, u32) {
    // then find the guard that slept the most
    let mut most_sleepy_guard = 0;
    let mut most_minutes_slept = 0;
    for (id, slept) in minutes_slept.iter() {
        if *slept > most_minutes_slept {
            most_minutes_slept = *slept;
            most_sleepy_guard = *id;
        }
    }
    // then find the minute that guard slept the most
    let guard_sleep_pattern = match sleep_map.get(&most_sleepy_guard) {
        Some(v) => v,
        None => panic!("most sleepy guard not found"),
    };
    let mut most_sleepy_minute = 0;
    let mut most_sleep = 0;
    for (minute, slept) in guard_sleep_pattern.iter().enumerate() {
        if *slept > most_sleep {
            most_sleep = *slept;
            most_sleepy_minute = minute;
        }
    }
    (most_sleepy_guard, most_sleepy_minute as u32)
}

fn get_most_slept_minute(sleep_map: &HashMap<u32, Vec<u32>>) -> (u32, u32) {
    // make a map of guard_id -> most minutes slept on particular minute
    struct SleepEntry {
        minute: u32,
        slept: u32,
    }
    let mut sleepy_minutes: HashMap<u32, SleepEntry> = HashMap::new();
    // iterate through each guard's sleep table
    for (id, sleep_table) in sleep_map.iter() {
        // find the minute that was slept on the most by that guard
        let mut most_slept_minute = 0;
        let mut most_slept = 0;
        for (minute, minutes_slept) in sleep_table.iter().enumerate() {
            if *minutes_slept > most_slept {
                most_slept = *minutes_slept;
                most_slept_minute = minute;
            }
        }
        // update the map with this guard's sleepiest minute
        sleepy_minutes.entry(*id).or_insert(SleepEntry {
            minute: most_slept_minute as u32,
            slept: most_slept,
        });
    }

    // now go through the map and find the guard that slept the most
    // on any particular minute
    let mut most_sleep_per_minute = 0;
    let mut most_sleepy_minute = 0;
    let mut most_sleepy_guard = 0;
    for (id, entry) in sleepy_minutes.iter() {
        if entry.slept > most_sleep_per_minute {
            most_sleep_per_minute = entry.slept;
            most_sleepy_minute = entry.minute;
            most_sleepy_guard = *id;
        }
    }
    
    // return the guard's id and the minute the guard sleeps the most on
    (most_sleepy_guard, most_sleepy_minute)
}

fn open_problem_file() -> String {
    let path = Path::new("data/day4.txt");
    let mut file = match File::open(&path) {
        Err(why) => panic!("could not open file: {}", why.description()),
        Ok(file) => file,
    };
    let mut s = String::new();
    match file.read_to_string(&mut s) {
        Err(why) => panic!("could not read file: {}", why.description()),
        Ok(_) => return s,
    };
}

fn parse_input(s: &str) -> Vec<LogEntry> {
    // split by line
    let lines = s.lines();
    let mut output: Vec<LogEntry> = Vec::with_capacity(s.len());
    for line in lines {
        // parse time in line
        let time = &line[1..17];
        let time = match Utc.datetime_from_str(time, "%Y-%m-%d %H:%M") {
            Ok(t) => t,
            Err(why) => panic!("could not parse time: {}", why.description()),
        };
        // if guard id is in line, parse it (index 3 by space)
        let split: Vec<&str> = line.split_whitespace().collect();
        let line_length = split.len();
        let mut guard_id: u32;
        if line_length > 5 {
            // we have guard information
            let guard_str = match split.get(3) {
                Some(v) => v,
                None => panic!("no guard id found"),
            };
            let guard_str = &guard_str[1..];
            guard_id = match guard_str.parse() {
                Ok(v) => v,
                Err(why) => panic!("could not parse guard id: {}", why.description()),
            };
        } else {
            // we will have to go through sorted vector to populate this info
            guard_id = 0;
        }
        // parse action text in line
        // action text is last two words of line
        // last word defines action: shift = begin, asleep = fall, up = wake
        let action = match split.get(line_length - 1) {
            Some(v) => v,
            None => panic!("no last word... ?"),
        };
        let action = match action {
            &"shift" => Action::BeginsShift,
            &"asleep" => Action::FallsAsleep,
            &"up" => Action::WakesUp,
            &_ => panic!("unsupported guard action: {}", action),
        };
        let entry = LogEntry {
            time,
            guard_id,
            action,
        };
        // push log entry to output vector
        output.push(entry);
    }

    // sort vector by time
    output.sort_unstable_by(|a, b| {
        a.time.cmp(&b.time)
    });

    // backfill guard ids
    let mut current_guard_id = 0;
    for entry in output.iter_mut() {
        if entry.guard_id > 0 {
            current_guard_id = entry.guard_id
        } else {
            entry.guard_id = current_guard_id;
        }
    }

    output
}