use std::collections::HashMap;
use std::collections::HashSet;
use std::cmp::Ordering;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

#[derive(Eq)]
#[derive(PartialEq)]
#[derive(Hash)]
#[derive(Debug)]
struct Node {
    val: String,
    parent: String,
    children: Vec<String>, // keys of other nodes
}

fn main() {
    let raw_input = open_problem_file();
    let parsed_input = parse_input(&raw_input);
    let tree = create_tree(parsed_input);
    determine_step_order(&tree);
}

fn determine_step_order(tree: &HashMap<&str, Node>) {
   // go to top of tree
}

fn create_tree(input: Vec<Vec<&str>>) -> HashMap<&str, Node> {
    // make a lookup table to get to a particular node reference
    let mut tree: HashMap<&str, Node> = HashMap::new();

    // now iterate through our pairs and hook them up
    for pair in input.iter() {
        let child_key = pair[1];
        let parent_key = pair[0];
        tree.entry(child_key).or_insert(Node {
            parent: parent_key.to_string(),
            val: child_key.to_string(),
            children: vec![],
        });
    }
    for pair in input.iter() {
        let child_key = pair[1];
        let parent_key = pair[0];
        tree.entry(parent_key)
            .and_modify(|node| { node.children.push(child_key.to_string()) })
            .or_insert(Node {
                parent: "".to_string(),
                val: parent_key.to_string(),
                children: vec![child_key.to_string()]
            });
    }
    tree
}

fn open_problem_file() -> String {
    let path = Path::new("data/day7_test.txt");
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

fn parse_input(s: &String) -> Vec<Vec<&str>> {
    s.lines()
        .map(|line| line.split_whitespace().collect())
        .map(|split: Vec<&str>| vec![split[1], split[7]])
        .collect()
    // [parent, child]
}
