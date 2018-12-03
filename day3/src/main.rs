use std::collections::HashMap;
use std::collections::HashSet;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

struct Section {
    row_start: usize,
    row_end: usize,
    col_start: usize,
    col_end: usize,
}

fn main() {
    let raw_input = open_problem_file();
    let parsed_input = parse_input(&raw_input);
    let solution_1 = find_overlaps(&parsed_input);
    println!("solution 1: {}", solution_1);
    let solution_2 = find_non_overlapper(&parsed_input);
    println!("solution 2: {}", solution_2);
}

fn find_overlaps(input: &HashMap<i32, Section>) -> i32 {
    let mut cloth = vec![vec![0; 1000]; 1000];
    // for each section, increment the counter on that square inch
    for section in input.values() {
        for row in section.row_start..section.row_end {
            for col in section.col_start..section.col_end {
                cloth[row][col] += 1;
            }
        }
    }
    // now that cloth has been updated, count >= 2 squares
    let mut total = 0;
    for row in cloth.iter() {
        for col in row.iter() {
            if *col >= 2 {
                total += 1;
            }
        }
    }
    total
}

fn find_non_overlapper(input: &HashMap<i32, Section>) -> &i32 {
    // create a set of all ids
    // iterate through hash map and update cloth
    // if any overlap occurs, remove id from map
    // there will be one id left in map at finish
    let mut cloth = vec![vec![0; 1000]; 1000];
    let mut ids: HashSet<&i32> = input.keys().collect();
    for (id, section) in input.iter() {
        for row in section.row_start..section.row_end {
            for col in section.col_start..section.col_end {
                if cloth[row][col] > 0 {
                    ids.remove(id);
                    ids.remove(&cloth[row][col]);
                }
                cloth[row][col] = *id; // mark with id
            }
        }
    }
    let mut final_id: &i32 = &0;
    for id in ids.iter() {
        final_id = id;
    }
    final_id
}

fn open_problem_file() -> String {
    let path = Path::new("data/day3.txt");
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

fn parse_input(s: &String) -> HashMap<i32, Section> {
    let lines = s.lines();
    // #123 @ 1,3: 4x4
    let mut output: HashMap<i32, Section> = HashMap::new();
    for line in lines {
        let parts: Vec<&str> = line.split_whitespace().collect();
        // [#123, @, 1,3:, 4x4]
        let id = match parts[0].get(1..) {
            Some(v) => v,
            None => panic!("no id found in line: {}", line),
        };
        let id: i32 = match id.parse() {
            Ok(v) => v,
            Err(why) => panic!("could not parse id: {}", why.description()),
        };

        let starts: Vec<&str> = parts[2].split(",").collect();
        let col_start: usize = match starts[0].parse() {
            Ok(v) => v,
            Err(why) => panic!("could not parse col start: {}", why.description()),
        };
        let row_start = match starts[1].get(..starts[1].len()-1) {
            Some(v) => v,
            None => panic!("row start not found"),
        };
        let row_start: usize = match row_start.parse() {
            Ok(v) => v,
            Err(why) => panic!("could not parse row start: {}", why.description()),
        };

        let ends: Vec<&str> = parts[3].split("x").collect();
        let col_end: usize = match ends[0].parse() {
            Ok(v) => v,
            Err(why) => panic!("could not parse col end: {}", why.description()),
        };
        let row_end: usize = match ends[1].parse() {
            Ok(v) => v,
            Err(why) => panic!("could not parse row end: {}", why.description()),
        };
        let col_end = col_start + col_end;
        let row_end = row_start + row_end;
        output.insert(id, Section {
            row_start,
            row_end,
            col_start,
            col_end,
        });
    }
    output
}