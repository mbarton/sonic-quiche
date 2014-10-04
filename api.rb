# Aggregated and modified Sonic Pi API. Original license stated below.
#--
# This file is part of Sonic Pi: http://sonic-pi.net
# Full project source: https://github.com/samaaron/sonic-pi
# License: https://github.com/samaaron/sonic-pi/blob/master/LICENSE.md
#
# Copyright 2013, 2014 by Sam Aaron (http://sam.aaron.name).
# All rights reserved.
#
# Permission is granted for use, copying, modification, distribution,
# and distribution of modified versions of this work as long as this
# notice is included.
#++

def print(output)
    %x{
        postMessage({ action: "log", data: output });
    }
end

def puts(output)
    print(output)
end

def rrand_i(min, max)
    %x{
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
end

def dice(num_sides=6)
    rrand_i(1, num_sides)
end

def one_in(num)
    rrand_i(1, num) == 1
end

def rrand(min, max)
    %x{
        return Math.random() * (max - min + 1) + min;
    }
end

def rand(max=1)
    rrand(0, max)
end

def rand_i(max=2)
    rrand_i(0, max)
end

def choose(list)
    list[rand_i(list.length)]
end

def use_random_seed(seed, &block)
    raise "use_random_seed does not work with a block. Perhaps you meant with_random_seed" if block

    %x{
        postMessage({ action: "warn", data: "Random number seeding is not supported in your web browser" })
    }
end

def with_random_seed(seed, &block)
    raise "with_random_seed requires a block. Perhaps you meant use_random_seed" unless block
    use_random_seed(seed)
    block.call
end

