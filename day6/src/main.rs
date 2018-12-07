use std::collections::HashMap;
use std::collections::HashSet;
use std::error::Error;
use std::fs::File;
use std::io::prelude::*;
use std::path::Path;

#[derive(Eq)]
#[derive(PartialEq)]
#[derive(Hash)]
struct Loc {
    row: i32,
    col: i32,
}
struct Grid {
    row_start: i32,
    row_end: i32,
    col_start: i32,
    col_end: i32,
}

fn main() {
    let raw_input = open_problem_file();
    let points = parse_input(raw_input);
    let grid = build_grid(&points);
    let heat_map = build_heat_map(&grid, &points);
    let solution_1 = find_largest_area(&heat_map, &grid);
    println!("solution 1: {}", solution_1);
    let solution_2 = find_region(&grid, &points);
    println!("solution 2: {}", solution_2);
}

fn find_region(grid: &Grid, points: &HashSet<Loc>) -> i32 {
    // for each location in grid, get distance to all points
    // if all distances added together < 10000, increment total region area
    let mut total = 0;
    for row in grid.row_start..grid.row_end+1 {
        for col in grid.col_start..grid.col_end+1 {
            let this_loc = Loc {row, col};
            let mut all_distances = 0;
            for point in points.iter() {
                all_distances += distance(&this_loc, point);
            }
            if all_distances < 10000 {
                total += 1;
            }
        }
    }
    total
}

fn distance(a: &Loc, b: &Loc) -> i32 {
    (a.row - b.row).abs() + (a.col - b.col).abs()
}

fn find_largest_area(heat_map: &HashMap<Loc, &Loc>, grid: &Grid) -> i32 {
    let mut areas: HashMap<&Loc, i32> = HashMap::new();
    let boundaries = vec![grid.row_start, grid.row_end, grid.col_start, grid.col_end];
    // go through our map of Loc->Loc
    for parent in heat_map.values() {
        // if the parent Loc is not infinite
        // add it to a map of Loc-># of els
        // initialize map with 1 to represent self
        *areas.entry(*parent).or_insert(1) += 1;
    }

    // remove infinites
    for (child, parent) in heat_map.iter() {
        if boundaries.contains(&child.row) || boundaries.contains(&child.col) {
            areas.remove(parent);
        }
    }
    // and finally go through that map to get the max value
    let (_parent, size) = areas.iter().max_by(|&(_a, a_dist), &(_b, b_dist)| {
        a_dist.cmp(&b_dist)
    }).unwrap();
    *size
}

fn build_heat_map<'a, 'b>(grid: &Grid, points: &'b HashSet<Loc>) -> HashMap<Loc, &'b Loc> {
    let mut distance_map: HashMap<Loc, &Loc> = HashMap::new();
    // for every point on the grid
    for row in grid.row_start..grid.row_end+1 {
        for col in grid.col_start..grid.col_end+1 {
            let this_point = Loc {row, col};
            // skip our original points
            if points.contains(&this_point) {
                continue
            }
            // calculate the distance from
            // this point to all points in our set
            // and get the minimum
            let mut no_min = false;
            let mut min_dist = i32::max_value();
            let mut closest_point = points.iter().by_ref().nth(0).unwrap();
            for point in points.iter() {
                let dist = distance(point, &this_point);
                if dist < min_dist {
                    min_dist = dist;
                    closest_point = point;
                }
            }
            // determine if we have a tie
            for point in points.iter() {
                let dist = distance(point, &this_point);
                if dist == min_dist && point != closest_point {
                    // we have a tie
                    no_min = true;
                    break
                }
            }
            // if there was a tie, we don't add to hash map
            if no_min {
                continue
            }
            // store the minimum distance in a map of Loc->Loc
            distance_map.insert(this_point, closest_point);
        }
    }
    distance_map
}

fn build_grid(input: &HashSet<Loc>) -> Grid {
    // identify top of box -- smallest row
    let top = input.iter().min_by(|x, y| x.row.cmp(&y.row)).unwrap();
    // identify left edge of box -- smallest col
    let left = input.iter().min_by(|x, y| x.col.cmp(&y.col)).unwrap();
    // identify bottom edge of box -- largest row
    let bottom = input.iter().max_by(|x, y| x.row.cmp(&y.row)).unwrap();
    // identify right edge of box -- largest col
    let right = input.iter().max_by(|x, y| x.col.cmp(&y.col)).unwrap();
    
    Grid {
        row_start: top.row,
        row_end: bottom.row,
        col_start: left.col,
        col_end: right.col,
    }
}

fn open_problem_file() -> String {
    let path = Path::new("data/day6.txt");
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

fn parse_input(input: String) -> HashSet<Loc> {
    input.lines()
        .map(|el| el
            .split(", ")
            .filter_map(|n| n.parse().ok())
            .collect()
        )
        .map(|loc: Vec<i32>| Loc { row: loc[1], col: loc[0] })
        .collect()
}