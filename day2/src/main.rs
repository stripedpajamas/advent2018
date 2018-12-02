use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

fn main() {
    let raw_input = open_problem_file();
    let parsed_input = parse_input(&raw_input);
    let solution_1 = get_id_checksum(&parsed_input);
    println!("solution 1: {}", solution_1);
    let (solution_2a, solution_2b) = get_similar_ids(&parsed_input);
    println!("solution 2: \n{}\n{}", solution_2a, solution_2b);
}

fn get_similar_ids(input: &Vec<&str>) -> (String, String) {
    // for each id, iterate through each letter
    // with the other ids. if a difference is found
    // set a flag and keep going. if another difference
    // is found, skip that pair. 
    let mut out1 = String::new();
    let mut out2 = String::new();
    for i in 0..input.len() {
        for j in i+1..input.len() {
            let mut id_1_chars = input[i].chars();
            let mut id_2_chars = input[j].chars();
            let mut errors = 0;
            loop {
                let v1 = match id_1_chars.next() {
                    Some(v) => v,
                    None => break
                };
                let v2 = match id_2_chars.next() {
                    Some(v) => v,
                    None => break
                };
                if v1 != v2 {
                    if errors < 2 {
                        errors += 1;
                    } else {
                        break;
                    }
                }
            }
            if errors == 1 {
                // found our pair
                out1 = input[i].into();
                out2 = input[j].into();
                return (out1, out2);
            }
        }
    }
    return (out1, out2);
}

fn get_id_checksum(input: &Vec<&str>) -> i32 {
    // for each line, count letter occurrences
    // after counting, make note of any exact 2 or 3 counts
    let mut two_counts = 0;
    let mut three_counts = 0;
    for id in input.iter() {
        let mut letters: HashMap<char, i32> = HashMap::new();
        for ch in id.chars() {
            let counter = letters.entry(ch).or_insert(0);
            *counter += 1;
        }
        let mut found_two = false;
        let mut found_three = false;
        for count in letters.values() {
            if found_two && found_three {
                break;
            }
            if *count == 2 && !found_two {
                two_counts += 1;
                found_two = true;
            }
            if *count == 3 && !found_three {
                three_counts += 1;
                found_three = true;
            }
        }
    }
    return two_counts * three_counts;
}

fn open_problem_file() -> String {
    let path = Path::new("data/day2.txt");
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

fn parse_input(s: &String) -> Vec<&str> {
    let split = s.split("\n");
    let vec_of_strs: Vec<&str> = split.collect();
    return vec_of_strs;
}