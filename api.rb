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

%x{
    var _reserved = {
        thread_id: 0,
        current_thread: 0,
        sleep_mul: 0.5, // 120 BPM,
        send: function(action, data) {
            if(action == "complete" || _reserved.current_thread == _reserved.thread_id) {
                postMessage({action: action, data: data, thread_id: _reserved.thread_id});
            }
        }
    };
}

def print(output)
    %x{
        _reserved.send("log", output);
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
        _reserved.send("warn", "Random number seeding is not supported in web browsers");
    }
end

def with_random_seed(seed, &block)
    raise "with_random_seed requires a block. Perhaps you meant use_random_seed" unless block
    use_random_seed(seed)
    block.call
end

def use_bpm(bpm, &block)
    raise "use_bpm does not work with a block. Perhaps you meant with_bpm" if block

    %x{
        _reserved.sleep_mul = 60.0 / bpm;
    }
end

def with_bpm(bpm, &block)
    raise "with_bpm must be called with a block. Perhaps you meant use_bpm" unless block
    old_bpm = current_bpm
    use_bpm(bpm)
    block.call
    use_bpm(old_bpm)
end

def current_bpm
    %x{
        return 60.0 / _reserved.sleep_mul;
    }
end

def rt(t)
    %x{
        return t / _reserved.sleep_mul;
    }
end

def sleep(seconds)
    %x{
        _reserved.send("sleep", (seconds * _reserved.sleep_mul));
    }
end

def sync(cue_id)
    %x{
        _reserved.send("sync", cue_id);
    }
end

def cue(cue_id)
    %x{
        _reserved.send("cue", cue_id);
    }
end

def wait(time)
    if time.is_a? Symbol
        sync(time)
    else
        sleep(time)
    end
end

def in_thread(*opts, &block)
    %x{
        if(_reserved.current_thread + 1 == _reserved.thread_id) {
            _reserved.current_thread++;
            block.$call();
            _reserved.current_thread--;
        } else {
            _reserved.send("worker", _reserved.current_thread + 1);
        }
    }
end

def _reserved_body
    [[code_body]]
end

%x{
    onmessage = function(initEvent) {
        _reserved.thread_id = initEvent.data.thread_id;

        try {
            $opal.Object._proto.$_reserved_body();
        } catch(err) {
            _reserved.send("error", err.toString());
        }

        _reserved.send("complete", {});
    }
}