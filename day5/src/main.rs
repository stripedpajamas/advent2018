use std::collections::HashMap;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

fn main() {
    let raw_input = open_problem_file();
    let input: Vec<char> = raw_input.chars().collect();
    let solution_1 = react(input.clone());
    println!("solution 1: {}", solution_1);
    let solution_2 = improve_reaction(&input);
    println!("solution 2: {}", solution_2);
}

fn improve_reaction(input: &Vec<char>) -> usize {
    // keep track of the effect of removing an element
    let mut removed: HashMap<String, usize> = HashMap::new();
    // loop through the input
    for letter in input.iter() {
        // don't check a letter twice
        let key = letter.to_lowercase().to_string();
        if removed.contains_key(&key) {
            continue;
        }
        // create input that does not have this element
        let mut filtered: Vec<char> = input.clone().into_iter().filter(|x| {
            x.to_lowercase().to_string() != key
        }).collect();
        let length_after_reaction = react(filtered);
        removed.insert(key, length_after_reaction);
    }

    // return the minimum length after reaction
    match removed.values().min() {
        Some(v) => *v,
        None => 0,
    }
}

fn will_react(a: char, b: char) -> bool {
    if a.to_lowercase().to_string() == b.to_lowercase().to_string() {
        if (a.is_lowercase() && !b.is_lowercase()) || (a.is_uppercase() && !b.is_uppercase()) {
            // when next char is same letter but different case
            return true
        }
    }
    return false
}

// returns the length of input after all reactions
fn react(mut input: Vec<char>) -> usize {
    let mut reaction_occurred = false;
    // iterate through each char
    for i in 0..input.len()-1 {
        let mut left = i;
        let mut right = i+1;
        while right < input.len() {
            if will_react(input[left], input[right]) {
                input[left] = '$';
                input[right] = '$';
                reaction_occurred = true;
                if left == 0 {
                    break
                }
                left -= 1;
                right += 1;
            } else {
                // no reaction, move on
                break
            }
        }
    }
    // now remove the $
    input.retain(|x| x != &'$');
    // continue until flag is not set
    if reaction_occurred {
        return react(input)
    }
    return input.len()
}

fn open_problem_file() -> String {
    let path = Path::new("data/day5.txt");
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

