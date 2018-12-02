use std::collections::HashSet;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

fn main() {
    let raw_input = open_problem_file();
    let parsed_input = parse_input(&raw_input);
    let solution_1: &i32 = &parsed_input.iter().sum();
    println!("solution 1: {}", solution_1);
    let solution_2: i32 = find_repeated_freq(&parsed_input);
    println!("solution 2: {}", solution_2);
}

fn find_repeated_freq(input: &Vec<i32>) -> i32 {
    // we may need to repeat the input list a lot
    // but we will keep track of freqs that have occurred
    let mut freqs: HashSet<i32> = HashSet::new();
    let mut total: i32 = 0;
    loop {
        for x in input.iter() {
            total += x;
            if !freqs.insert(total) {
                return total;
            }
        }
    }
}

fn open_problem_file() -> String {
    let path = Path::new("data/day1.txt");
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

fn parse_input(s: &String) -> Vec<i32> {
    let split = s.split("\n");
    let vec_of_strs: Vec<&str> = split.collect();
    let parsed: Vec<i32> = vec_of_strs.iter().map(|x| {
        x.parse().expect("could not parse")
    }).collect();
    return parsed;
}
