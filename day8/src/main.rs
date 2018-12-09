use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

struct Node {
    num_children: i32,
    num_meta: i32,
    children: Vec<Node>,
    meta: Vec<i32>,
}

fn main() {
    let raw_input = open_problem_file();
    let parsed_input = parse_input(raw_input);
    println!("{:?}", parsed_input);
}

fn create_node(input: &[i32]) {
    let in_iter = input.iter();
    while let n = in_iter.next(); n != None {
        if children > 0 {
            // this is a child, so make a node

        }
    }
}

fn parse_input(s: String) -> Vec<i32> {
    s.split_whitespace()
        .filter_map(|x| x.parse().ok())
        .collect()
}

fn open_problem_file() -> String {
    let path = Path::new("data/day8_test.txt");
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