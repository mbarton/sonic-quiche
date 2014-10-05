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
        next_node_id: 0,
        sleep_mul: 0.5, // 120 BPM,
        transpose: 0,
        synth: "square",
        send: function(action, data) {
            if(action == "complete" || _reserved.current_thread == _reserved.thread_id) {
                postMessage({action: action, data: data, thread_id: _reserved.thread_id});
            }
        }
    };
}

def resolve_synth_opts_hash_or_array(opts)
    case opts
    when Hash
        return opts
    when Array
        s = opts.size
        return Hash[*opts] if s.even? && s > 1
        case s
        when 1
            case opts[0]
            when Hash
                return opts[0]
            else
                raise "Invalid options. Options should either be an even list of key value pairs, a single Hash or nil. Got a single value array where the value isn't a Hash"
            end
        when 0
            return {}
        end
    when NilClass
        return {}
    else
        raise "Invalid options. Options should either be an even list of key value pairs, a single Hash or nil. Got something completely different"
    end
end

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
        _reserved.send("cmd", {type: "sleep", length: (seconds * _reserved.sleep_mul)});
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

def use_arg_bpm_scaling(bool, &block)
    raise "use_arg_bpm_scaling does not work with a block. Perhaps you meant with_arg_bpm_scaling" if block

    %x{
        _reserved.arg_bpm_scaling = bool;
    }
end

def with_arg_bpm_scaling(bool, &block)
    raise "with_arg_bpm_scaling must be called with a block. Perhaps you meant use_arg_bpm_scaling" unless block

    %x{
        var oldValue = _reserved.arg_bpm_scaling;
        _reserved.arg_bpm_scaling = bool;
        block.$call();
        _reserved.arg_bpm_scaling = oldValue;
    }
end

def midi_to_hz(n)
    n = note(n) unless n.is_a? Numeric
    440.0 * (2 ** ((n - 69) / 12.0))
end

def hz_to_midi(freq)
    (12 * (Math.log(freq * 0.0022727272727) / Math.log(2))) + 69
end

def note(n, *args)
    return nil if (n.nil? || n == :r || n == :rest)
    return Note.resolve_midi_note_without_octave(n) if args.empty?
    args_h = resolve_synth_opts_hash_or_array(args)
    octave = args_h[:octave]
    if octave
        Note.resolve_midi_note(n, octave)
    else
        Note.resolve_midi_note_without_octave(n)
    end
end

def note_info(n, *args)
    args_h = resolve_synth_opts_hash_or_array(args)
    octave = args_h[:octave]
    Note.new(n, octave)
end

def degree(degree, tonic, scale)
    Scale.resolve_degree(degree, tonic, scale)
end

def scale(tonic, name, *opts)
    opts = resolve_synth_opts_hash_or_array(opts)
    opts = {:num_octaves => 1}.merge(opts)
    Scale.new(tonic, name,  opts[:num_octaves])
end

def chord(tonic, name=:major, *opts)
    if tonic.is_a? Array
        raise "List passed as parameter to chord needs two elements i.e. chord([:e3, :minor]), you passed: #{tonic.inspect}" unless tonic.size == 2
        Chord.new(tonic[0], tonic[1]).to_a
    else
        Chord.new(tonic, name).to_a
    end
end

def set_sched_ahead_time!(t)
    sleep(t)
end

def current_transpose
    %x{
        return _reserved.transpose;
    }
end

def use_transpose(shift, &block)
    raise "use_transpose does not work with a do/end block. Perhaps you meant with_transpose" if block
    raise "Transpose value must be a number, got #{shift.inspect}" unless shift.is_a?(Numeric)

    %x{
        _reserved.transpose = shift;
    }
end

def with_transpose(shift, &block)
    raise "with_transpose requires a do/end block. Perhaps you meant use_transpose" unless block
    raise "Transpose value must be a number, got #{shift.inspect}" unless shift.is_a?(Numeric)

    %x{
        var oldValue = _reserved.transpose;
        _reserved.transpose = shift;
        block.$call();
        _reserved.transpose = oldValue;
    }
end

def current_volume
    %x{
        return _reserved.volume;
    }
end

def set_volume!(vol)
    max_vol = 5
    if (vol > max_vol)
        new_vol = max_vol
    elsif (vol < 0)
        new_vol = 0
    else
        new_vol = vol
    end

    %x{
        _reserved.volume = new_vol;
    }
end

def current_synth
    %x{
        return _reserved.synth;
    }
end

def use_synth(synth, &block)
    raise "use_synth does not work with a do/end block. Perhaps you meant with_synth" if block

    %x{
        _reserved.synth = synth;
    }
end

def with_synth(synth, &block)
    raise "with_synth must be called with a do/end block. Perhaps you meant use_synth" unless block

    %x{
        var oldValue = _reserved.synth;
        _reserved.synth = synth;
        block.$call();
        _reserved.synth = oldValue;
    }
end

def current_synth_defaults
    %x{
        return _reserved.synth_defaults;
    }
end

def use_synth_defaults(*args, &block)
    %x{
        _reserved.synth_defaults = args;
    }
end

def use_merged_synth_defaults(*args, &block)
    raise "use_merged_synth_defaults does not work with a block. Perhaps you meant with_merged_synth_defaults" if block
    current_defs = current_synth_defaults
    args_h = resolve_synth_opts_hash_or_array(args)
    merged_defs = (current_defs || {}).merge(args_h)

    use_synth_defaults(merged_defs)
end

def with_synth_defaults(*args, &block)
    raise "with_synth_defaults must be called with a block" unless block
    current_defs = current_synth_defaults

    args_h = resolve_synth_opts_hash_or_array(args)
    use_synth_defaults(args_h)
    block.call
    use_synth_defaults(current_dfs)
end

def with_merged_synth_defaults(*args, &block)
    raise "with_merged_synth_defaults must be called with a block" unless block
    current_defs = current_synth_defaults

    args_h = resolve_synth_opts_hash_or_array(args)
    merged_defs = (current_defs || {}).merge(args_h)
    with_synth_defaults(merged_defs, block)
end

def recording_start
    %x{
        _reserved.send("warn", "Sonic Quiche does not yet support recodings. Sad soup.");
    }
end

def recording_stop
    %x{
        _reserved.send("warn", "Sonic Quiche does not yet support recodings. Sad soup.");
    }
end

def recording_save
    %x{
        _reserved.send("warn", "Sonic Quiche does not yet support recodings. Sad soup.");
    }
end

def recording_delete
    %x{
        _reserved.send("warn", "Sonic Quiche does not yet support recodings. Sad soup.");
    }
end

def synth(synth, *args)
    args_h = resolve_synth_opts_hash_or_array(args)

    if args.has_key? :note
        n = args_h[:note]
        n = n.call if n.is_a? Proc
        n = note(n) unless n.is_a? Numeric
        n += current_transpose

        args_h[:note] = n
    end

    _reserved_trigger_inst synth, args_h
end

def play(n, *args)
    return play_chord(n, *args) if n.is_a?(Array)
    n = n.call if n.is_a? Proc
    return nil if (n.nil? || n == :r || n == :rest)

    init_args_h = {}
    args_h = resolve_synth_opts_hash_or_array(args)

    if n.is_a? Numeric
        # Do nothing
    elsif n.is_a? Hash
        init_args_h = resolve_synth_opts_hash_or_array(n)

        n = note(init_args_h[:note])
        return nil if n.nil?
        n
    else
        n = note(n)
    end

    n += current_transpose
    
    args_h[:note] = n

    synth = current_synth
    final_args = init_args_h.merge(args_h)

    %x{
        _reserved.send("cmd", {type: "note", synth: synth, args: final_args.map});
    }
end

def play_pattern(notes, *args)
    notes.each{|note| play(note, *args) ; sleep 1 }
end

def play_pattern_timed(notes, times, *args)
    if times.is_a? Array
        notes.each_with_index{|note, idx| play(note, *args) ; sleep(times[idx % times.size])}
    else
        notes.each_with_index{|note, idx| play(note, *args) ; sleep times}
    end
end

def play_chord(notes, *args)
    shift = current_transpose
    shifted_notes = notes.map do |n|
        n = note(n) unless n.is_a? Numeric
        n + shift
    end

    synth_name = current_synth
    trigger_chord(synth_name, shifted_notes, args)
end

def sample(name, *args_a_or_h)
    args_h = resolve_synth_opts_hash_or_array(args_a_or_h)
    
    %x{
        var _reserved_node_id = "" + _reserved.thread_id + "-" + _reserved.next_node_id;
        _reserved.next_node_id++;
        _reserved.send("cmd", {type: "sample", node_id: _reserved_node_id, sample: name, args: args_h.map});
        return _reserved_node_id;
    }
end

def control(node, *args)
    args_h = resolve_synth_opts_hash_or_array(args)
    n = args_h[:note]
    args_h[:note] = note(n) if n

    _reserved_control node, args_h
end

def stop(node)
    _reserved_stop node
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